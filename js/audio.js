// 音乐播放器核心逻辑

// 音乐列表数据
const musicList = [
    { id: 0, title: '24215220234黄贤臻', author: '云汐', src: './audio/music0.mp3', recordImg: './img/record0.jpg', bgImg: './img/bg0.png' },
    { id: 1, title: 'Yesterday', author: 'The Beatles', src: './audio/music1.mp3', recordImg: './img/record1.jpg', bgImg: './img/bg1.png' },
    { id: 2, title: '江南烟雨色', author: '杨树人', src: './audio/music2.mp3', recordImg: './img/record2.jpg', bgImg: './img/bg2.png' },
    { id: 3, title: 'Vision pt.II', author: 'Lost Sky', src: './audio/music3.mp3', recordImg: './img/record3.jpg', bgImg: './img/bg3.png' }
];

// DOM元素
const audioTag = document.getElementById('audioTag');
const playPauseBtn = document.getElementById('playPause');
const skipForwardBtn = document.getElementById('skipForward');
const skipBackwardBtn = document.getElementById('skipBackward');
const progressTotal = document.getElementById('progress-total');
const progress = document.getElementById('progress');
const playedTime = document.getElementById('playedTime');
const audioTime = document.getElementById('audioTime');
const volumeSlider = document.getElementById('volumn-togger');
const volumeBtn = document.getElementById('volume');
const playModeBtn = document.getElementById('playMode');
const listBtn = document.getElementById('list');
const musicListDiv = document.getElementById('music-list');
const closeListDiv = document.getElementById('close-list');
const musicTitle = document.getElementById('music-title');
const authorName = document.getElementById('author-name');
const recordImg = document.getElementById('record-img');
const speedBtn = document.getElementById('speed');
const mvBtn = document.getElementById('MV');

// 状态变量
let currentIndex = 0;
let playMode = 0; // 0:顺序播放, 1:单曲循环, 2:随机播放
let isPlaying = false;
let isMuted = false;

// 初始化
function init() {
    updateMusicInfo();
    audioTag.src = musicList[0].src; // 设置初始音频源
    audioTag.volume = volumeSlider.value / 100;
    // 设置初始播放模式图标
    updatePlayModeIcon();
    
    // 添加事件监听
    playPauseBtn.addEventListener('click', togglePlayPause);
    skipForwardBtn.addEventListener('click', playNext);    // 下一首
    skipBackwardBtn.addEventListener('click', playPrevious); // 上一首
    progressTotal.addEventListener('click', seekTo);
    volumeSlider.addEventListener('input', changeVolume);
    volumeBtn.addEventListener('click', toggleMute);
    playModeBtn.addEventListener('click', changePlayMode);
    listBtn.addEventListener('click', toggleMusicList);
    closeListDiv.addEventListener('click', toggleMusicList);
    audioTag.addEventListener('timeupdate', updateProgress);
    audioTag.addEventListener('loadedmetadata', updateDuration);
    audioTag.addEventListener('ended', onMusicEnded);
    speedBtn.addEventListener('click', changeSpeed);
    mvBtn.addEventListener('click', openMV);
    
    // 为列表项添加点击事件
    for (let i = 0; i < musicList.length; i++) {
        document.getElementById(`music${i}`).addEventListener('click', () => playMusic(i));
    }
}

// 更新音乐信息
function updateMusicInfo() {
    const music = musicList[currentIndex];
    musicTitle.textContent = music.title;
    authorName.textContent = music.author;
    // 更新唱片图片
    recordImg.style.backgroundImage = `url(${music.recordImg})`;
    // 更新背景图片
    document.body.style.backgroundImage = `url(${music.bgImg})`;
}

// 播放指定音乐
function playMusic(index) {
    currentIndex = index;
    updateMusicInfo();
    audioTag.src = musicList[index].src;
    audioTag.currentTime = 0;
    // 根据播放模式设置loop属性
    audioTag.loop = (playMode === 1);  // 单曲循环模式设置
    playAudio();
}

// 播放音频
function playAudio() {
    audioTag.play().then(() => {
        isPlaying = true;
        playPauseBtn.className = 'icon-pause';
        recordImg.style.animationPlayState = 'running';
    }).catch(err => {
        console.log('自动播放被阻止，请手动点击播放');
    });
}

// 暂停音频
function pauseAudio() {
    audioTag.pause();
    isPlaying = false;
    playPauseBtn.className = 'icon-play';
    recordImg.style.animationPlayState = 'paused';
}

// 切换播放/暂停
function togglePlayPause() {
    if (isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

// 上一首
function playPrevious() {
    if (playMode === 2) {
        // 随机播放：避免连续播放同一首歌
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * musicList.length);
        } while (newIndex === currentIndex && musicList.length > 1);
        currentIndex = newIndex;
    } else {
        currentIndex = (currentIndex - 1 + musicList.length) % musicList.length;
    }
    playMusic(currentIndex);
}

// 下一首
function playNext() {
    if (playMode === 2) {
        // 随机播放：避免连续播放同一首歌
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * musicList.length);
        } while (newIndex === currentIndex && musicList.length > 1);
        currentIndex = newIndex;
    } else {
        currentIndex = (currentIndex + 1) % musicList.length;
    }
    playMusic(currentIndex);
}

// 音乐播放结束处理
function onMusicEnded() {
    if (playMode === 1) {
        // 单曲循环：使用loop属性自动循环，这里不需要额外处理
        // 但为了兼容性，保留回退逻辑
        audioTag.currentTime = 0;
        audioTag.play();
    } else {
        playNext();
    }
}

// 进度条点击跳转
function seekTo(e) {
    const rect = progressTotal.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioTag.currentTime = percent * audioTag.duration;
}

// 更新进度条
function updateProgress() {
    if (audioTag.duration && !isNaN(audioTag.duration)) {
        const percent = (audioTag.currentTime / audioTag.duration) * 100;
        progress.style.width = percent + '%';
    }
    playedTime.textContent = formatTime(audioTag.currentTime);
}

// 更新总时长
function updateDuration() {
    audioTime.textContent = formatTime(audioTag.duration);
    // 触发一次进度更新确保时间显示正确
    updateProgress();
}

// 格式化时间
function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) {
        return '00:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 改变音量
function changeVolume() {
    audioTag.volume = volumeSlider.value / 100;
    if (audioTag.volume === 0) {
        isMuted = true;
        volumeBtn.className = 'center-icon mute';
    } else {
        isMuted = false;
        volumeBtn.className = 'center-icon volume';
    }
}

// 切换静音
function toggleMute() {
    if (isMuted) {
        audioTag.volume = volumeSlider.value / 100;
        isMuted = false;
        volumeBtn.className = 'center-icon volume';
    } else {
        audioTag.volume = 0;
        isMuted = true;
        volumeBtn.className = 'center-icon mute';
    }
}

// 更新播放模式图标
function updatePlayModeIcon() {
    switch(playMode) {
        case 0:
            // 顺序播放
            playModeBtn.style.backgroundImage = 'url("./img/mode2.png")';
            break;
        case 1:
            // 单曲循环
            playModeBtn.style.backgroundImage = 'url("./img/mode1.png")';
            break;
        case 2:
            // 随机播放
            playModeBtn.style.backgroundImage = 'url("./img/mode3.png")';
            break;
    }
}

// 切换播放模式
function changePlayMode() {
    playMode = (playMode + 1) % 3;
    // 更新loop属性
    audioTag.loop = (playMode === 1);
    // 更新播放模式图标
    updatePlayModeIcon();
}

// 切换音乐列表显示
function toggleMusicList() {
    if (musicListDiv.style.display === 'none' || musicListDiv.style.display === '') {
        musicListDiv.style.display = 'block';
        closeListDiv.style.display = 'block';
        musicListDiv.className = 'music-list list-card-show';
    } else {
        musicListDiv.className = 'music-list list-card-hide';
        closeListDiv.style.display = 'none';
        setTimeout(() => {
            musicListDiv.style.display = 'none';
        }, 1000);
    }
}

// 切换播放速度
function changeSpeed() {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentSpeed = audioTag.playbackRate;
    const currentIndex = speeds.indexOf(currentSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    audioTag.playbackRate = speeds[nextIndex];
    speedBtn.textContent = speeds[nextIndex] + 'X';
}

// 打开MV（预留功能）
function openMV() {
    alert('MV功能开发中');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);