let player;
let currentSubtitleIndex = 0;
let subtitles = [];
let subtitleTimes = [];
let subtitleEndTimes = []; // Mảng lưu thời gian kết thúc
let subtitleTimeout; // Biến để lưu ID của timeout

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "514",
    width: "914",
    videoId: "DZc_IvpHetw",
  });
}
onYouTubeIframeAPIReady();
function startListening() {
  fetch("./public/subtitles/Deutsch lernen mit Dialogen_19.vtt")
    .then((response) => response.text())
    .then((data) => {
      parseVTT(data);
      displayCurrentSubtitle();
      document.getElementById("practise").style.display = "block"; // Hiển thị phần tử
      document.getElementById("start-listening-btn").style.display = "none"; // Ẩn nút bắt đầu nghe
    });
}

function parseVTT(data) {
  const lines = data.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("-->")) {
      const timeRange = lines[i].split(" --> ");
      const startTime = convertToSeconds(timeRange[0]);
      const endTime = convertToSeconds(timeRange[1]); // Thêm thời gian kết thúc
      const text = lines[i + 1];
      subtitles.push(text);
      subtitleTimes.push(startTime);
      subtitleEndTimes.push(endTime);
      console.log("subtitleTimes ", subtitleTimes);
      console.log("subtitleEndTimes ", subtitleEndTimes); // Lưu thời gian kết thúc
      i++; // Bỏ qua dòng tiếp theo
    }
  }
}

function convertToSeconds(time) {
  const parts = time.split(":");
  let seconds = 0;

  // Nếu có 3 phần tử (hh:mm:ss)
  if (parts.length === 3) {
    seconds += parseFloat(parts[0]) * 3600; // Giờ
    seconds += parseFloat(parts[1]) * 60; // Phút
    seconds += parseFloat(parts[2]); // Giây
  }
  // Nếu có 2 phần tử (mm:ss)
  else if (parts.length === 2) {
    seconds += parseFloat(parts[0]) * 60; // Phút
    seconds += parseFloat(parts[1]); // Giây
  }
  // Nếu chỉ có 1 phần tử (giây)
  else if (parts.length === 1) {
    seconds += parseFloat(parts[0]); // Giây
  }

  return seconds;
}

function displayCurrentSubtitle() {
  if (currentSubtitleIndex < subtitles.length) {
    const currentSubtitle = subtitles[currentSubtitleIndex];
    document.getElementById("current-subtitle").innerText = `${
      currentSubtitleIndex + 1
    }/${subtitles.length}`;
    player.seekTo(subtitleTimes[currentSubtitleIndex], true);
    player.playVideo();

    // Hủy bỏ timeout trước đó nếu có
    clearTimeout(subtitleTimeout);

    // Thiết lập timeout mới
    subtitleTimeout = setTimeout(() => {
      player.pauseVideo();
    }, (subtitleEndTimes[currentSubtitleIndex] - subtitleTimes[currentSubtitleIndex]) * 1000); // Dừng video khi hết thời gian phụ đề
  }
}

function checkAnswer() {
  const userInput = document.getElementById("input").value;
  const correctSubtitle = subtitles[currentSubtitleIndex];

  if (userInput.trim() === "") {
    document.getElementById("correct-subtitle").innerText = correctSubtitle; // Hiển thị phụ đề đúng với từ cần điền // Không hiển thị thông báo nếu chưa nhập gì
  }

  if (userInput.trim() === correctSubtitle) {
    document.getElementById("correct-subtitle").style.display = "none"; // Ẩn phụ đề đúng
    document.getElementById("input").value = ""; // Xóa nội dung đã nhập trước đó
    nextSubtitle();
  } else {
    document.getElementById("correct-subtitle").innerText = correctSubtitle; // Hiển thị phụ đề đúng với từ cần điền
    document.getElementById("correct-subtitle").style.display = "block"; // Hiển thị phụ đề đúng
  }
}

function skipSubtitle() {
  currentSubtitleIndex++;
  document.getElementById("input").value = ""; // Xóa ô nhập
  document.getElementById("correct-subtitle").style.display = "none"; // Ẩn phụ đề đúng
  document.getElementById("message").innerText = ""; // Xóa thông báo
  displayCurrentSubtitle(); // Hiển thị câu tiếp theo
}

function prevSubtitle() {
  if (currentSubtitleIndex > 0) {
    currentSubtitleIndex--;
    displayCurrentSubtitle();
  }
}

function nextSubtitle() {
  if (currentSubtitleIndex < subtitles.length - 1) {
    currentSubtitleIndex++;
    displayCurrentSubtitle();
  }
}

function playCurrentSubtitle() {
  player.seekTo(subtitleTimes[currentSubtitleIndex], true);
  player.playVideo();
  // Hủy bỏ timeout trước đó nếu có
  clearTimeout(subtitleTimeout);

  // Thiết lập timeout mới
  subtitleTimeout = setTimeout(() => {
    player.pauseVideo();
  }, (subtitleEndTimes[currentSubtitleIndex] - subtitleTimes[currentSubtitleIndex]) * 1000);
}

document.getElementById("input").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    checkAnswer();
  }
});

// Thêm sự kiện input để ẩn đáp án đúng khi có sự thay đổi
document.getElementById("input").addEventListener("input", function () {
  document.getElementById("correct-subtitle").style.display = "none"; // Ẩn đáp án đúng
});

// Thêm sự kiện cho các phím Ctrl, mũi tên và Delete
document.addEventListener("keydown", function (event) {
  // Kiểm tra nếu phím Delete được nhấn
  if (event.key === "Delete") {
    nextSubtitle();
    skipSubtitle(); // Bỏ qua phụ đề hiện tại
  }

  // Kiểm tra nếu phím Ctrl và phím mũi tên phải được nhấn
  if (event.ctrlKey && event.key === "Control") {
    playCurrentSubtitle(); // Phát lại phụ đề hiện tại
  }

  // Kiểm tra nếu phím mũi tên trái được nhấn
  if (event.key === "ArrowLeft") {
    prevSubtitle(); // Quay lại phụ đề trước
  }

  // Kiểm tra nếu phím mũi tên phải được nhấn
  if (event.key === "ArrowRight") {
    nextSubtitle(); // Qua phụ đề tiếp theo
  }
});
