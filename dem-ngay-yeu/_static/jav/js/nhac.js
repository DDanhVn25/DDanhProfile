// MUSIC PLAY
const MusicList=[
    "//thanhdieu.com/files/Em-Nào-Có-Tội.mp3",
    "//thanhdieu.com/files/Anh-Đã-Quen-Với-Cô-Đơn.mp3",
    "//thanhdieu.com/files/Về-Bên-Anh.mp3",
];
let t=parseInt(localStorage.getItem('td')) || Math.floor(Math.random() * MusicList.length);
const audio=new Audio(MusicList[t]);
function MusicPlay() {audio.play();}
document.addEventListener('click', MusicPlay);
audio.addEventListener("ended", function() {
t=(t + 1) % MusicList.length;
localStorage.setItem('td', t);
audio.src=MusicList[t];
audio.play();
});