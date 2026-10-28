function getWeather() {
  return { condition: "晴", temperature: 22, tip: "适合骑行" };
}

function recommendRoutes(formData) {
  let candidates = routes.filter(function (r) { return r.campus === formData.campus; });

  const min = formData.duration * 0.7;
  const max = formData.duration * 1.3;
  candidates = candidates.filter(function (r) {
    return r.duration >= min && r.duration <= max;
  });

  if (formData.pace === "休闲") {
    candidates = candidates.filter(function (r) { return r.difficulty === "休闲"; });
  } else if (formData.pace === "较快") {
    candidates = candidates.filter(function (r) { return r.difficulty !== "休闲"; });
  }

  candidates.forEach(function (r) {
    r.score = 0;
    formData.scenery.forEach(function (s) {
      if (r.scenery.includes(s)) r.score += 10;
    });
    formData.shops.forEach(function (s) {
      if (r.shops.includes(s)) r.score += 5;
    });
  });

  candidates.sort(function (a, b) { return b.score - a.score; });
  return candidates.slice(0, 5);
}

function renderResults(results, weather, campus) {
  let html = "";
  html += '<a href="#" class="back-btn" onclick="location.reload(); return false;">← 返回修改</a>';
  html += '<div class="weather-bar">🌤 今日天气：' + weather.condition + ' ' + weather.temperature + '°C · ' + weather.tip + '</div>';
  html += '<h2 style="margin-bottom:20px;">为你推荐 ' + results.length + ' 条路线（' + campus + '校区）</h2>';

  results.forEach(function (r) {
    html += '<div class="route-card">';
    html += '<h3>' + r.name + '</h3>';
    html += '<div class="route-meta">🚴 往返 ' + r.distance + ' km · ⏱ 约 ' + r.duration + ' 分钟 · ' + r.difficulty + '</div>';
    html += '<div>';
    r.scenery.forEach(function (s) { html += '<span class="tag">🌿 ' + s + '</span>'; });
    r.shops.forEach(function (s) { html += '<span class="tag">🛒 ' + s + '</span>'; });
    html += '</div>';
    html += '<p class="route-desc">' + r.description + '</p>';
    html += '<div class="route-tips">💡 ' + r.tips + '</div>';
    html += '</div>';
    html += '<a href="nav.html?id=' + r.id + '" class="nav-btn">📍 查看导航 →</a>';
    html += '</div>';
  });

  document.querySelector(".container").innerHTML = html;
}

function init() {
  console.log("init 开始");

  // ===== 滑块联动 =====
  const durationSlider = document.getElementById("duration");
  const durationValEl = document.getElementById("durationVal");

  if (durationSlider && durationValEl) {
    durationSlider.addEventListener("input", function () {
      durationValEl.textContent = this.value + " 分钟";
    });
    console.log("滑块绑定成功");
  } else {
    console.error("滑块元素没找到", durationSlider, durationValEl);
  }

  // ===== 表单提交 =====
  const form = document.getElementById("routeForm");
  if (!form) {
    console.error("找不到 routeForm");
    return;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("点击了按钮");

    const campusEl = document.querySelector('input[name="campus"]:checked');
    if (!campusEl) { alert("请选择校区"); return; }
    const campus = campusEl.value;
    const duration = parseInt(durationSlider.value);
    const pace = document.getElementById("pace").value;

    const scenery = [];
    document.querySelectorAll('input[name="scenery"]:checked').forEach(function (cb) {
      scenery.push(cb.value);
    });

    const shops = [];
    document.querySelectorAll('input[name="shops"]:checked').forEach(function (cb) {
      shops.push(cb.value);
    });

    if (typeof routes === "undefined") {
      alert("路线数据未加载，请检查 data.js");
      return;
    }

    const formData = { campus: campus, duration: duration, pace: pace, scenery: scenery, shops: shops };
    const weather = getWeather();
    const results = recommendRoutes(formData);

    console.log("推荐结果：", results);
    renderResults(results, weather, campus);
  });

  console.log("init 完成");
}

init();

