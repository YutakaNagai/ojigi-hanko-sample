<template>
    <header>
        <div class="header__inner">
            <img src="../assets/logo.jpg" />
            <h1 class="header__title">
                <div>THE</div>
                <div>OJIGI</div>
                <div>HANKO</div>
            </h1>

            <!-- <div class="hamburger-menu">
                <input type="checkbox" id="menu-btn-check" />
                <label for="menu-btn-check" class="menu-btn"
                    ><span></span
                ></label>

                <div class="menu-content">
                    <ul>
                        <li>
                            <a href="#">メニューリンク1</a>
                        </li>
                        <li>
                            <a href="#">メニューリンク2</a>
                        </li>
                        <li>
                            <a href="#">メニューリンク3</a>
                        </li>
                    </ul>
                </div>
            </div> -->
        </div>
    </header>
</template>

<style scoped>
.header__inner {
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(190, 190, 190, 0.5);
    height: 9vh;
    width: 100vw;
    text-align: left;
}
.header__title {
    padding: 0;
    margin: 0;
}
img {
    height: 90%;
    margin: 0 0 auto;
    padding: 0.1rem 1rem;
    display: inline-block;
}
h1 {
    margin: auto;
    font-size: 1.5rem;
    display: inline-block;
    /* padding: 0 1rem; */
    font-style: italic;
}

.menu-btn {
    position: fixed;
    top: 1vh;
    right: 1vh;
    display: flex;
    height: 6vh;
    width: 6vh;
    justify-content: center;
    align-items: center;
    z-index: 90;
    background-color: #3584bb;
}
.menu-btn span,
.menu-btn span:before,
.menu-btn span:after {
    content: "";
    display: block;
    height: 3px;
    width: 25px;
    border-radius: 3px;
    background-color: #ffffff;
    position: absolute;
}
.menu-btn span:before {
    bottom: 8px;
}
.menu-btn span:after {
    top: 8px;
}

#menu-btn-check:checked ~ .menu-btn span {
    background-color: rgba(
        255,
        255,
        255,
        0
    ); /*メニューオープン時は真ん中の線を透明にする*/
}
#menu-btn-check:checked ~ .menu-btn span::before {
    bottom: 0;
    transform: rotate(45deg);
}
#menu-btn-check:checked ~ .menu-btn span::after {
    top: 0;
    transform: rotate(-45deg);
}

#menu-btn-check {
    display: none;
}
#menu-btn-check:checked ~ .menu-content {
    left: 0; /*メニューを画面内へ*/
}

.menu-content {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 100%; /*leftの値を変更してメニューを画面外へ*/
    z-index: 80;
    background-color: #3584bb;
    transition: all 0.5s; /*アニメーション設定*/
    opacity: 0.8;
}
.menu-content ul {
    padding: 70px 10px 0;
}
.menu-content ul li {
    border-bottom: solid 1px #ffffff;
    list-style: none;
}
.menu-content ul li a {
    display: block;
    width: 100%;
    font-size: 15px;
    box-sizing: border-box;
    color: #ffffff;
    text-decoration: none;
    padding: 9px 15px 10px 0;
    position: relative;
}
.menu-content ul li a::before {
    content: "";
    width: 7px;
    height: 7px;
    border-top: solid 2px #ffffff;
    border-right: solid 2px #ffffff;
    transform: rotate(45deg);
    position: absolute;
    right: 11px;
    top: 16px;
}
</style>
