import parseDOM from '/parseDOM.js';
import api from '/apiExecute.js';

window.onload = (event) => {
    // バージョン
    document.getElementById('version').innerText = "ver" + chrome.runtime.getManifest().version;

    chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
        // 手動記録メニュー表示制御
        if (tab[0].url=='https://game.granbluefantasy.jp/#item') {
            document.getElementById("repost-none").style.display = "none";
            document.getElementById("repostBtn").style.display = "";
        } else {
            document.getElementById("repost-none").style.display = "";
            document.getElementById("repostBtn").style.display = "none";
        }
    });
    
};

document.getElementById('repostBtn').addEventListener('click',  () => {
    chrome.storage.local.get(['settings'], result => {
        const settings = result.settings;
        if (undefined === settings || !("username" in settings) || !("password" in settings)) {
            console.log('settings undefined');
            return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
            // item画面でなければ終了
            if (tab[0].url=='https://game.granbluefantasy.jp/#item') {
                return;
            }

            // ボタン
            const btn = document.getElementById('repostBtn');
            btn.innerHTML = '<div class="spinner-border spinner-border-sm text-light" role="status"><span class="visually-hidden">Loading...</span></div>';
            btn.classList.add('disabled');

            chrome.scripting.executeScript({
                target: {tabId:tab[0].id},
                func: parseDOM,
                args: ["history", settings, tab[0].url],
            }).then(async (result) => {
                // 何もなければ失敗
                if (!result[0].result) {
                    throw new Error('データ記録失敗');
                }

                // データ送信
                const apiResult = await api("/api/drop", "POST", result[0].result, settings);
                if (!apiResult) {
                    throw new Error('データ記録失敗');
                }

                // ポップアップ
                const toast = new bootstrap.Toast(document.querySelector('.toast.mySuccess'));
                toast.show();


                // 通知
                if ("notification" in settings && settings.notification) {
                    const drop = result[0].result.items.join(",");
                    let iconUrl = "gold48.png";
                    if (drop.indexOf("ヒヒイロカネ") > -1) {
                        iconUrl = "hihi48.png";
                    } else if (drop.indexOf("至極の指輪") > -1) {
                        iconUrl = "shigoku48.png";
                    } else if (drop.indexOf("覇業の指輪") > -1) {
                        iconUrl = "hagyo48.png";
                    } else if (drop.indexOf("栄冠の指輪") > -1) {
                        iconUrl = "eikan48.png";
                    } else if ("グランデ" == result[0].result.enemy) {
                        iconUrl = "grande48.png";
                    } else if ("アーカーシャ" == result[0].result.enemy) {
                        iconUrl = "akasha48.png";
                    }
                    const options = {
                        type: "basic",
                        title: "データを記録しました",
                        message: drop,
                        iconUrl: iconUrl,
                    };
                    chrome.notifications.create(null, options, () => {});
                }

                // トークン更新
                if ("accessToken" in apiResult) {
                    settings.accessToken = apiResult.accessToken;
                }
                if ("refreshToken" in apiResult) {
                    settings.refreshToken = apiResult.refreshToken;
                }
                if (settings != result.settings) {
                    chrome.storage.local.set({ settings: settings }, () => {});
                }
            })
            .catch ((e) => {
                // ポップアップ
                const toast = new bootstrap.Toast(document.querySelector('.toast.myFailed'));
                toast.show();
            })
            .finally (() => {
                // ボタン
                const btn = document.getElementById('repostBtn');
                btn.innerText = "実行";
                btn.classList.remove('disabled');
            })
            ;
        });
    });
});

document.getElementById('houchiBtnCreate').addEventListener('click',  () => {
    chrome.storage.local.get(['settings'], result => {
        // 設定が取得できなければ終了
        const settings = result.settings;
        if (undefined === settings || !("username" in settings) || !("password" in settings)) {
            console.log('settings undefined');
            return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
            // 共闘画面でなければ終了
            if (!tab[0].url.startsWith('https://game.granbluefantasy.jp/#lobby/room')) {
                return;
            }

            // ボタン
            const btn = document.getElementById('houchiBtnCreate');
            btn.innerHTML = '<div class="spinner-border spinner-border-sm text-light" role="status"><span class="visually-hidden">Loading...</span></div>';
            btn.classList.add('disabled');

            chrome.scripting.executeScript({
                target: {tabId:tab[0].id},
                func: getHouchiData,
                args: [],
            }).then(async (result) => {
                const data = result[0].result;
                if (!data) {
                    throw new Error('invalid executeScript data');
                }
                
                // API実行
                data.message = document.getElementById("houchiMessageCreate").value;
                const apiResult = await api("/api/houchi", "POST", result[0].result, settings);
                if (!apiResult) {
                    throw new Error('api failed: ' + apiResult);
                }

                // ポップアップ
                const toast = new bootstrap.Toast(document.querySelector('.toast.mySuccess'));
                toast.show();

                // 放置狩り部屋作成状態とトークン更新
                if (apiResult.accessToken) {
                    settings.accessToken = apiResult.accessToken;
                }
                if (apiResult.refreshToken) {
                    settings.refreshToken = apiResult.refreshToken;
                }
                const houchi = { status: 1, roomId: data.roomId, battle: data.battle, message: data.message, createdAt: Date.now(), updatedAt: Date.now() };
                chrome.storage.local.set({ settings: settings, houchi: houchi }, () => {});
                
                // フォーム表示切り替え
                document.getElementById("houchi-none").style.display = "none";
                document.getElementById("houchi-form-create").style.display = "none";
                document.getElementById("houchi-form-update").style.display = "";
                document.getElementById("houchiMessageUpdate").value = houchi.message;
                document.getElementById("houchiBattle").innerText = houchi.battle;
                document.getElementById("houchiRoomId").innerText = houchi.roomId;
            })
            .catch ((e) => {
                console.log(e);
                // ポップアップ
                const toast = new bootstrap.Toast(document.querySelector('.toast.myFailed'));
                toast.show();
            })
            .finally (() => {
                // ボタン
                const btn = document.getElementById('houchiBtnCreate');
                btn.innerText = "実行";
                btn.classList.remove('disabled');
            })
            ;
        });
    });
});

document.getElementById('houchiBtnUpdate').addEventListener('click',  () => {
    chrome.storage.local.get(['settings', 'houchi'], result => {
        // 設定が取得できなければ終了
        const settings = result.settings;
        if (undefined === settings || !("username" in settings) || !("password" in settings)) {
            console.log('settings undefined');
            return;
        }

        // 放置狩り部屋作成中でなければ終了
        if (!("houchi" in result)) {
            console.log('no houchi found');
            return;
        }

        // API実行
        const data = {roomId: result.houchi.roomId, battle: result.houchi.battle, message: document.getElementById("houchiMessageUpdate").value};
        api("/api/houchi", "PUT", data, settings);

        // 情報更新
        result.houchi.message = data.message;
        result.houchi.updatedAt = Date.now();
        chrome.storage.local.set({ houchi: result.houchi }, () => {});

        // ポップアップ
        const toast = new bootstrap.Toast(document.querySelector('.toast.mySuccess'));
        toast.show();
    });
});

document.getElementById('houchiBtnDelete').addEventListener('click',  () => {
    chrome.storage.local.get(['settings', 'houchi'], result => {
        // 設定が取得できなければ終了
        const settings = result.settings;
        if (undefined === settings || !("username" in settings) || !("password" in settings)) {
            console.log('settings undefined');
            return;
        }

        // 放置狩り部屋作成中でなければ終了
        if (!("houchi" in result)) {
            console.log('no houchi found');
            return;
        }

        // API実行
        const data = {roomId: result.houchi.roomId, battle: result.houchi.battle};
        api("/api/houchi/delete", "PUT", data, settings);

        // 放置狩り部屋情報削除
        chrome.storage.local.remove(['houchi'], () => {});

        // フォーム表示切替
        document.getElementById("houchiMessageCreate").value = "";
        document.getElementById("houchiMessageUpdate").value = "";
        document.getElementById("houchiBattle").innerText = "";
        document.getElementById("houchiRoomId").innerText = "";
        chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
            if (tab[0].url.startsWith('https://game.granbluefantasy.jp/#lobby/room')) {
                // 放置狩り部屋作成中でなくロビー画面なら作成ボタンを表示
                document.getElementById("houchi-none").style.display = "none";
                document.getElementById("houchi-form-create").style.display = "";
                document.getElementById("houchi-form-update").style.display = "none";
            } else {
                // 放置狩り部屋作成中でなくロビー画面以外なら非表示
                document.getElementById("houchi-none").style.display = "";
                document.getElementById("houchi-form-create").style.display = "none";
                document.getElementById("houchi-form-update").style.display = "none";
            }
        });

        // ポップアップ
        const toast = new bootstrap.Toast(document.querySelector('.toast.mySuccess'));
        toast.show();
    });
});

function getHouchiData()
{
    return {"roomId": document.querySelector(".txt-room-id").innerText, "battle": document.querySelector(".txt-quest-name").innerText};
}

document.getElementById('option-link').addEventListener('click',  () => {
    chrome.runtime.openOptionsPage();
});