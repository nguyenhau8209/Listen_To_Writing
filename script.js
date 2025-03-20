let player;
let subtitles = [];
let currentSubtitleIndex = 0;
let score = 0;

function loadVideo() {
  const url = document.getElementById("video-url").value;
  const videoId = extractVideoId(url);

  if (!videoId) {
    alert("URL không hợp lệ!");
    return;
  }

  if (player) {
    player.loadVideoById(videoId);
  } else {
    player = new YT.Player("player", {
      height: "360",
      width: "640",
      videoId: videoId,
      events: {
        onReady: () => fetchSubtitles(videoId),
        onStateChange: onPlayerStateChange,
      },
    });
  }
}

function extractVideoId(url) {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/
  );
  return match ? match[1] : null;
}
async function fetchSubtitles(videoId) {
  try {
    const response = await fetch(
      `https://youtubetranscript.com/api?videoId=${videoId}`
    );
    const data = await response.json();

    subtitles = data.map((sub) => ({
      start: sub.start,
      end: sub.start + sub.duration,
      text: sub.text,
    }));

    console.log("Phụ đề đã tải:", subtitles);
  } catch (error) {
    console.error("Lỗi khi lấy phụ đề:", error);
    alert("Không thể lấy phụ đề tự động.");
  }
}
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    checkSubtitles();
  }
}

function checkSubtitles() {
  if (!player || subtitles.length === 0) return;

  const currentTime = player.getCurrentTime();
  const subtitle = subtitles[currentSubtitleIndex];

  if (
    subtitle &&
    currentTime >= subtitle.start &&
    currentTime <= subtitle.end
  ) {
    document.getElementById("subtitle").style.display = "none"; // Ẩn phụ đề
  }

  if (subtitle && currentTime > subtitle.end) {
    currentSubtitleIndex++;
  }

  requestAnimationFrame(checkSubtitles);
}
function checkAnswer() {
  const userInput = document.getElementById("input").value.trim().toLowerCase();
  const correctAnswer = subtitles[currentSubtitleIndex]?.text
    .trim()
    .toLowerCase();

  if (!correctAnswer) return;

  if (userInput === correctAnswer) {
    document.getElementById("message").innerText = "Chính xác!";
    score += 10;
    document.getElementById("score").innerText = `Điểm: ${score}`;
    currentSubtitleIndex++;
    document.getElementById("input").value = "";

    // Chuyển sang câu tiếp theo
    if (currentSubtitleIndex < subtitles.length) {
      player.seekTo(subtitles[currentSubtitleIndex].start, true);
    }
  } else {
    document.getElementById("message").innerText = "Sai rồi, thử lại!";
    document.getElementById("subtitle").innerText =
      subtitles[currentSubtitleIndex].text;
    document.getElementById("subtitle").style.display = "block"; // Hiện phụ đề khi sai
    player.seekTo(subtitles[currentSubtitleIndex].start, true); // Phát lại đoạn sai
  }
}
