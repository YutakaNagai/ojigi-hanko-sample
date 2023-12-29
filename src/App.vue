<template>
    <div>
        お名前:
        <input
            style="display: inline-block"
            type="text"
            v-model="playerName"
            @change="createPlayerNameArray()"
        />
        <a
            class="btn --mini"
            @click="setFontSize()"
            style="display: inline-block"
            >改名</a
        >
    </div>
    <p>プレイヤーの名前を更新するよ</p>
    <a class="btn" @click="updateRandomName()">転職</a>
    <p>プレイヤー以外の名前を更新するよ</p>
    <div v-if="familyOwnedBonus > 10">
        【家族経営ボーナス】: 基本スコア x{{ familyOwnedBonus }}
    </div>
    <div>SCORE: {{ score }}</div>
    <div>BEST: {{ bestScore }}</div>

    <table border="1px solid black">
        <tr>
            <th v-for="(character, index) in characterList" :key="index">
                {{ character.post }}
            </th>
        </tr>

        <tr>
            <td
                v-for="(character, index) in characterList"
                :key="index"
                :id="`area_${index}`"
            >
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
                    <div :id="`text_${index}`" class="centeredText">
                        <div v-for="char in character.name" :key="char">
                            {{ char }}
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    </table>
    <div>
        <a class="btn" @click="isRotate ? stop() : rotate()">
            {{ isRotate ? "STAMP!" : "ROTATE!" }}
        </a>
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
            isSuccess: false,
            continuousPoint: 0,
            resultKey: "",
            score: 0,
            bestScore: localStorage.getItem("best_score") || 0,
            randomDeg: 0,
            RESULT_INFO,
            playerName: "",
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

        this.setFontSize();
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
            localStorage.setItem("before_score", this.score);
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem("best_score", this.score);
            }
        },
        setObj() {
            // 成功していた場合、回転速度が10％アップ
            this.rotateSpeed = this.isSuccess ? this.rotateSpeed * 0.9 : 5000;
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

            this.setFontSize();
        },

        setFontSize() {
            const areaElem = document.getElementById("area_0");
            const areaSize = areaElem.getBoundingClientRect().height;
            this.characterList.forEach((character, index) => {
                const len = character.name.length;

                const textElem = document.getElementById(`text_${index}`);
                textElem.style.fontSize = `${(areaSize / len) * 0.8}px`;
            });
        },
    },

    computed: {},
};
</script>

<style scoped>
.btn {
    display: block;
    text-align: center;
    vertical-align: middle;
    text-decoration: none;
    width: 6rem;
    margin: auto;
    padding: 0.2rem 2rem;
    font-weight: bold;
    border-radius: 100vh;
    border-bottom: 0.3rem solid #0686b2;
    background: #27acd9;
    color: #fff;
    cursor: pointer;
}
.--mini {
    width: 2rem;
}
.btn:active {
    margin-top: 0.1rem;
    border-bottom: 0.1rem solid #0686b2;
    color: #fff;
}
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
    display: flex;
    writing-mode: vertical-rl;
    align-items: center;
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
