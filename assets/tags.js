/**
 * CorPath 标签页逻辑（原生 JS，无依赖）
 * 数据源：assets/posts.js 中的 window.CORPATH_POSTS
 *
 * 功能：
 *   - 汇总所有文章的标签，生成标签云（含每标签文章数）
 *   - 通过 URL 参数 ?tag=xxx 筛选，跨「人生之路 / 开发之路」两条路一起展示
 *   - 不传 tag 时按时间倒序显示全部文章
 */
(function () {
  "use strict";

  var posts = window.CORPATH_POSTS || [];
  var cloudEl = document.getElementById("tagCloud");
  var resultsEl = document.getElementById("tagResults");
  var titleEl = document.getElementById("tagResultTitle");
  if (!cloudEl || !resultsEl) return;

  // 当前选中的标签（URL 解码）
  var params = new URLSearchParams(window.location.search);
  var active = params.get("tag") || "";

  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function tagHref(tag) {
    return "tags.html?tag=" + encodeURIComponent(tag);
  }

  // 统计各标签的文章数
  var counts = {};
  posts.forEach(function (p) {
    (p.tags || []).forEach(function (t) {
      counts[t] = (counts[t] || 0) + 1;
    });
  });
  var allTags = Object.keys(counts).sort(function (a, b) {
    return counts[b] - counts[a] || a.localeCompare(b, "zh-CN");
  });

  // ---- 渲染标签云 ----
  function renderCloud() {
    var frag = document.createDocumentFragment();

    var all = document.createElement("a");
    all.className = "tag-chip" + (active === "" ? " active" : "");
    all.href = "tags.html";
    all.textContent = "全部 " + posts.length;
    frag.appendChild(all);

    allTags.forEach(function (t) {
      var chip = document.createElement("a");
      chip.className = "tag-chip" + (active === t ? " active" : "");
      chip.href = tagHref(t);
      chip.textContent = t + " " + counts[t];
      frag.appendChild(chip);
    });

    cloudEl.innerHTML = "";
    cloudEl.appendChild(frag);
  }

  // ---- 渲染筛选结果 ----
  function renderResults() {
    var list = posts.filter(function (p) {
      return active === "" || (p.tags || []).indexOf(active) > -1;
    });
    list.sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    });

    if (titleEl) {
      titleEl.textContent = active === "" ? "全部文章" : "标签 · " + active;
    }

    if (list.length === 0) {
      resultsEl.innerHTML = '<li class="post-item"><p class="empty-note">这个标签下还没有文章。</p></li>';
      return;
    }

    var frag = document.createDocumentFragment();
    list.forEach(function (p) {
      var isLife = p.path === "life";
      var li = document.createElement("li");
      li.className = "post-item";

      var meta = document.createElement("div");
      meta.className = "meta";
      var badge = document.createElement("span");
      badge.className = "folder-tag" + (isLife ? " life" : "");
      badge.textContent = isLife ? "人生之路" : "开发之路";
      meta.appendChild(badge);
      meta.appendChild(document.createTextNode(" "));
      var time = document.createElement("time");
      time.textContent = p.date || "";
      meta.appendChild(time);
      li.appendChild(meta);

      var a = document.createElement("a");
      a.href = p.url;
      var h3 = document.createElement("h3");
      h3.textContent = p.title || "";
      a.appendChild(h3);
      li.appendChild(a);

      var ex = document.createElement("p");
      ex.className = "excerpt";
      ex.textContent = p.excerpt || "";
      li.appendChild(ex);

      // 文章自身的标签（可点击继续筛选）
      if (p.tags && p.tags.length) {
        var row = document.createElement("div");
        row.className = "post-tags";
        p.tags.forEach(function (t) {
          var ta = document.createElement("a");
          ta.className = "tag-mini" + (t === active ? " on" : "");
          ta.href = tagHref(t);
          ta.textContent = "# " + t;
          row.appendChild(ta);
        });
        li.appendChild(row);
      }

      frag.appendChild(li);
    });

    resultsEl.innerHTML = "";
    resultsEl.appendChild(frag);
  }

  renderCloud();
  renderResults();
})();
