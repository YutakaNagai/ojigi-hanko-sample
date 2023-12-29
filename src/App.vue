<template>
    <div>
        お名前:
        <input
            type="text"
            v-model="playerName"
            @change="createPlayerNameArray()"
        />
    </div>
    <button @click="updateRandomName()">
        転職（プレイヤー以外の名前の更新）
    </button>
    <div v-if="familyOwnedBonus > 10">
        【家族経営ボーナス】: 基本スコア x{{ familyOwnedBonus }}
    </div>
    <div>SCORE: {{ score }}</div>
    <div>BEST: {{ bestScore }}</div>

    <table border="1px solid black">
        <tr>
            <th>社長</th>
            <th>部長</th>
            <th>課長</th>
            <th>係長</th>
        </tr>

        <tr>
            <td v-for="(character, index) in characterList" :key="index">
                <div
                    :id="`circle_${index}`"
                    class="circle"
                    :style="
                        character.isPlayer
                            ? isRotate
                                ? 'opacity: 0.2'
                                : 'opacity: 1;'
                            : { transform: `rotate(-${character.deg}deg)` }
                    "
                >
                    <div class="centeredText">
                        <div v-for="char in character.name" :key="char">
                            {{ char }}
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    </table>
    <div>
        <button @click="isRotate ? stop() : rotate()">
            {{ isRotate ? "STAMP!" : "ROTATE!" }}
        </button>
    </div>

    <div>部長の角度: {{ characterList[1].deg }}</div>
    <div>あなたの角度: {{ degrees }}</div>
    <div>係長の角度: {{ characterList[3].deg }}</div>

    <div>連続成功回数: {{ continuousPoint }}回</div>
    <div>一周の回転速度: {{ rotateSpeed }}ms</div>

    <div
        v-if="!isRotate"
        class="result"
        :style="`color: ${RESULT_INFO[resultKey].color};`"
    >
        {{ RESULT_INFO[resultKey].message }}
    </div>

    <audio id="btn_audio">
        <source src="./assets/ペタッ.mp3" type="audio/mp3" />
    </audio>
</template>

<script>
import { RESULT_INFO, LAST_NAME_LIST } from "./util/const";

export default {
    data() {
        return {
            isRotate: true,
            obj: null,
            degrees: 0,
            syachou_deg: 0,
            syachouNameArray: [],
            buchou_deg: 0,
            buchouNameArray: [],
            kakarichou_deg: 0,
            kakarichouNameArray: [],
            isSuccess: false,
            continuousPoint: 0,
            resultKey: "",
            score: 0,
            bestScore: 0,
            randomDeg: 0,
            RESULT_INFO,
            playerName: "",
            playerNameArray: [],
            familyOwnedBonus: 1,
            rotateSpeed: 3000,
            characterList: [
                {
                    post: "社長",
                    deg: 0,
                    name: "",
                    isPlayer: false,
                },
                {
                    post: "部長",
                    deg: 0,
                    name: "",
                    isPlayer: false,
                },
                {
                    post: "あなた",
                    deg: 0,
                    name: "",
                    isPlayer: true,
                },
                {
                    post: "係長",
                    deg: 0,
                    name: "",
                    isPlayer: false,
                },
            ],
        };
    },

    mounted() {
        // アニメーションのオブジェクトを取得
        this.setObj();

        // 回転した状態でスタートさせる
        this.obj.play();

        this.setDigs();

        // プレイヤーの苗字設定
        this.playerName = this.getRandomNameArray().join("");
        this.createPlayerNameArray();

        // その他の苗字設定
        this.updateRandomName();
    },

    methods: {
        rotate() {
            if (this.obj) {
                this.setObj();
                this.isRotate = true;
                this.obj.play();
                this.setDigs();
                if (!this.isSuccess) {
                    this.continuousPoint = 0;
                    this.score = 0;
                    this.updateRandomName();
                }
            }
        },
        stop() {
            if (this.obj) {
                this.isRotate = false;
                this.obj.pause();
                const currentTime = this.obj.currentTime;
                const totalDuration = this.obj.effect.getTiming().duration;
                const currentDegrees = (360 * currentTime) / totalDuration;

                this.degrees = currentDegrees;
                this.degrees = this.degrees - this.randomDeg;
                while (this.degrees > 360) {
                    this.degrees = this.degrees - 360;
                }
                if (this.degrees < 0) {
                    this.degrees = this.degrees + 360;
                }

                document.getElementById("btn_audio").currentTime = 0; //連続クリックに対応
                document.getElementById("btn_audio").play(); //クリックしたら音を再生

                // 判定
                if (
                    this.degrees > this.characterList[1].deg &&
                    this.degrees < this.characterList[3].deg
                ) {
                    this.isSuccess = true;
                    this.continuousPoint++;

                    // テクニカルポイント処理
                    if (this.degrees - this.characterList[1].deg <= 5) {
                        this.resultKey = "PERFECT";
                    } else if (this.degrees - this.characterList[1].deg <= 10) {
                        this.resultKey = "GREAT";
                    } else if (this.degrees - this.characterList[1].deg <= 15) {
                        this.resultKey = "COOL";
                    } else {
                        this.resultKey = "SUCCESS";
                    }

                    this.score =
                        this.score +
                        RESULT_INFO[this.resultKey].point *
                            this.familyOwnedBonus;
                    this.updateBestScore();
                } else {
                    this.isSuccess = false;
                    this.resultKey = "FAILED";
                }
            }
        },
        setDigs() {
            // 社長の角度設定
            this.characterList[0].deg = 0;
            // 部長の角度設定(15-30度)
            this.characterList[1].deg = Math.random() * 16 + 15;
            // 係長の角度設定(60-90度)
            this.characterList[3].deg = Math.random() * 31 + 60;
        },
        updateBestScore() {
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
            }
        },
        setObj() {
            // 成功していた場合、回転速度が10％アップ
            this.rotateSpeed = this.isSuccess ? this.rotateSpeed * 0.9 : 3000;
            this.rotateSpeed = 5000;
            // ref属性を使用して要素の参照を取得
            const circleElem = document.getElementById("circle_2");
            // 回転の開始角度としてランダムな値をthis.objに保存する
            this.randomDeg = Math.random() * 360;
            this.obj = circleElem.animate(
                [
                    { transform: `rotate(${this.randomDeg}deg)` },
                    { transform: `rotate(${this.randomDeg - 360}deg)` },
                ],
                {
                    duration: this.rotateSpeed,
                    iterations: Infinity,
                }
            );
        },
        createPlayerNameArray() {
            this.characterList[2].name = [...this.playerName];
        },
        getRandomNameArray() {
            const lastNameIndex = Math.floor(
                Math.random() * LAST_NAME_LIST.length
            );
            return [...LAST_NAME_LIST[lastNameIndex]];
        },
        updateRandomName() {
            // 長たちの苗字をランダム設定
            this.characterList[0].name = this.getRandomNameArray();
            this.characterList[1].name = this.getRandomNameArray();
            this.characterList[3].name = this.getRandomNameArray();

            // 家族経営ボーナスの設定
            const nameList = [
                this.characterList[0].name.join(""),
                this.characterList[1].name.join(""),
                this.characterList[3].name.join(""),
            ];
            let duplicatedFamilyNameCountList = new Array(nameList.length).fill(
                0
            );
            nameList.forEach((familyName) => {
                nameList.forEach((targetFamilyName, index) => {
                    if (familyName === targetFamilyName) {
                        duplicatedFamilyNameCountList[index]++;
                    }
                });
            });

            const maxDuplicateCount = Math.max(
                ...duplicatedFamilyNameCountList
            );

            this.familyOwnedBonus =
                maxDuplicateCount > 1 ? maxDuplicateCount * 10 : 1;
        },

        getFontSize(len) {
            const circleElem = document.getElementsByClassName("circle")[0];
            const circleRect = circleElem.getBoundingClientRect();
            console.log("circleRect :>> ", circleRect);
            console.log("len :>> ", len);
            return "50px";
        },
    },

    computed: {},
};
</script>

<style scoped>
.circle {
    position: relative; /* 親要素を相対位置に設定 */
    width: 18vw;
    height: 18vw;
    border-radius: 50%;
    border: 3px solid red;
}

/* テキストを絶対位置で中央に配置 */
.centeredText {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* 中央揃え */
    text-align: center;
    color: red;
    font-size: xxx-large;
}

/* 縦書きのスタイルをそのままにする */
.centeredText div {
    writing-mode: vertical-rl;
}

.result {
    font-family: "arial black";
    font-size: xxx-large;
    text-align: center;
    animation: slide-out-anim 3s ease-in-out forwards;
    position: absolute;
    top: 20%;
    left: 0%;
    width: 80%;
}

@keyframes slide-out-anim {
    0% {
        opacity: 0;
        transform: translateX(-50%);
    }
    25% {
        opacity: 1;
    }
    75% {
        opacity: 0;
    }
    100% {
        opacity: 0;
        transform: translateX(100%);
    }
}
</style>
