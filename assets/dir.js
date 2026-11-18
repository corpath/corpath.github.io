/**
 * CorPath 目录页 / 首页 自动渲染脚本（原生 JS，无依赖）
 *
 * 1) 目录页：<body data-dir="dev"> 或 "dev/subfolder" 等多级路径。
 *    从 posts.js 的树里找到对应文件夹，把「文章」和「子文件夹」混在
 *    同一个列表里、以相同样式渲染；文章点开阅读，文件夹点开进入下一级目录。
 *    同时把该文件夹的标题/简介/面包屑也从数据里填好，新增目录几乎不用写正文。
 *
 * 2) 首页：存在 #homeLifeList / #homeDevList 时，从树里各取前几篇近期文章填入。
 */
(function () {
  "use strict";

  var tree = window.CORPATH_TREE;
  var findFolder = window.CORPATH_FIND_FOLDER;
  if (!tree || !findFolder) return;

  function esc(text) {
    return String(text == null ? "" : text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function tagHref(tag, base) {
    return base + "tags.html?tag=" + encodeURIComponent(tag);
  }

  // ---------- 目录页 ----------
  var dir = document.body.getAttribute("data-dir");
  if (dir) {
    var node = findFolder(dir);
    var depth = dir.split("/").filter(Boolean).length;
    var base = new Array(depth + 1).join("../"); // 回站点根的相对前缀
    var top = dir.split("/")[0];
    var theme = top === "life" ? "life" : "dev";

    // 标题区
    var board = document.querySelector(".board-head");
    if (board && node) {
      board.className = "board-head " + theme;
      var kicker = board.querySelector(".kicker");
      var heading = board.querySelector("h1");
      var lead = board.querySelector("p");
      if (kicker) kicker.textContent = node.kicker || "";
      if (heading) heading.textContent = node.title || "";
      if (lead) lead.textContent = node.desc || "";

      var crumb = board.querySelector(".crumb");
      if (crumb) {
        var parts = dir.split("/").filter(Boolean);
        var labels = ['<a href="' + esc(base + "index.html") + '">CorPath</a>'];
        var acc = [];
        parts.forEach(function (seg, i) {
          acc.push(seg);
          var n = findFolder(acc.join("/"));
          var label = esc(n && n.title ? n.title : seg);
          if (i === parts.length - 1) {
            labels.push(label);
          } else {
            var up = new Array(parts.length - i).join("../");
            labels.push('<a href="' + esc(up + "index.html") + '">' + label + "</a>");
          }
        });
        crumb.innerHTML = labels.join(" / ");
      }
    }

    // 列表：文章与子文件夹同级、同形
    var list = document.querySelector("[data-post-list]");
    if (list) {
      var children = (node && node.children) || [];
      if (!children.length) {
        list.innerHTML = '<li class="post-item"><p class="empty-note">这里还空着。第一篇内容，会从此刻开始生长。</p></li>';
      } else {
        var frag = document.createDocumentFragment();
        children.forEach(function (child) {
          var li = document.createElement("li");
          li.className = "post-item";

          var meta = document.createElement("div");
          meta.className = "meta";

          if (child.kind === "folder") {
            var fbadge = document.createElement("span");
            fbadge.className = "folder-tag folder-entry";
            fbadge.textContent = "文件夹";
            meta.appendChild(fbadge);

            var fa = document.createElement("a");
            fa.href = encodeURI(child.key) + "/index.html";
            var fh = document.createElement("h3");
            fh.textContent = (child.title || child.key) + " /";
            fa.appendChild(fh);
            li.appendChild(meta);
            li.appendChild(fa);

            var fex = document.createElement("p");
            fex.className = "excerpt";
            var cnt = countPosts(child);
            fex.textContent = (child.desc || "") + (cnt ? "（含 " + cnt + " 篇文章）" : "");
            li.appendChild(fex);
          } else {
            var time = document.createElement("time");
            time.textContent = child.date || "";
            meta.appendChild(time);
            (child.tags || []).forEach(function (t) {
              meta.appendChild(document.createTextNode(" · "));
              var ta = document.createElement("a");
              ta.className = "folder-tag" + (theme === "life" ? " life" : "");
              ta.href = tagHref(t, base);
              ta.textContent = t;
              meta.appendChild(ta);
            });

            var a = document.createElement("a");
            a.href = encodeURI(child.file);
            var h3 = document.createElement("h3");
            h3.textContent = child.title || "";
            a.appendChild(h3);
            li.appendChild(meta);
            li.appendChild(a);

            var ex = document.createElement("p");
            ex.className = "excerpt";
            ex.textContent = child.excerpt || "";
            li.appendChild(ex);
          }
          frag.appendChild(li);
        });
        list.innerHTML = "";
        list.appendChild(frag);
      }
    }
    return; // 目录页不再走首页逻辑
  }

  function countPosts(folder) {
    var n = 0;
    (folder.children || []).forEach(function (c) {
      if (c.kind === "post") n++;
      else if (c.kind === "folder") n += countPosts(c);
    });
    return n;
  }

  // ---------- 首页近期文章卡片 ----------
  var homeLife = document.getElementById("homeLifeList");
  var homeDev = document.getElementById("homeDevList");
  if (homeLife || homeDev) {
    [["life", homeLife], ["dev", homeDev]].forEach(function (pair) {
      var el = pair[1];
      if (!el) return;
      var folder = findFolder(pair[0]);
      var posts = [];
      (function collect(f, dirPath) {
        (f.children || []).forEach(function (c) {
          if (c.kind === "post") posts.push({ node: c, dir: dirPath });
          else if (c.kind === "folder") collect(c, dirPath + "/" + c.key);
        });
      })(folder || { children: [] }, pair[0]);
      posts.sort(function (a, b) {
        return (b.node.date || "").localeCompare(a.node.date || "");
      });
      posts = posts.slice(0, 3);

      if (!posts.length) {
        el.innerHTML = '<li><span class="empty-note">尚无文章，第一篇随时开始。</span></li>';
        return;
      }
      var frag = document.createDocumentFragment();
      posts.forEach(function (p) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = encodeURI(p.dir + "/" + p.node.file);
        var span = document.createElement("span");
        span.textContent = p.node.title || "";
        var tag = (p.node.tags || [])[0];
        if (tag) {
          var small = document.createElement("small");
          small.className = "inline-tag";
          small.textContent = tag;
          span.appendChild(small);
        }
        var time = document.createElement("time");
        time.textContent = p.node.date || "";
        a.appendChild(span);
        a.appendChild(time);
        li.appendChild(a);
        frag.appendChild(li);
      });
      el.innerHTML = "";
      el.appendChild(frag);
    });
  }
})();
