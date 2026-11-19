/**
 * CorPath 站点数据 —— 唯一数据源
 *
 * 结构：一棵目录树。顶层是 life（人生之路）与 dev（开发之路）两个文件夹。
 * 每个文件夹的 children 里可以混放两类节点：
 *   - kind:"post"    文章，file 是它在该文件夹内的文件名
 *   - kind:"folder"  子文件夹，key 是它的实际目录名，内部又有 children
 * 因此目录可以无限嵌套，文章与子文件夹天然同级。
 *
 * 本文件同时把树「扁平化」成 window.CORPATH_POSTS，供标签页使用：
 * 标签系统只认扁平清单，不关心文章藏在树的多深处，于是标签天然跨目录、跨两条路。
 *
 * 新增内容时通常只需要改这个文件 + 建对应 HTML，详情见 README.md。
 */
(function () {
  "use strict";

  var tree = {
    children: [
      {
        key: "life",
        dir: "life",
        title: "人生之路",
        kicker: "Path One · Life",
        desc: "旨在探求与追寻人生的幸福、价值与意义，比如世界观、人生观、道德观、历史观、幸福观等等。",
        theme: "life",
        children: [
          {
            kind: "post",
            date: "2026-11-19",
            title: "历史很少会简单地重演同一个剧本，它更喜欢换一套演员，换一套道具，写出一个看似熟悉实则完全不同的戏",
            file: "2026-11-19-历史很少会简单地重演同一个剧本，它更喜欢换一套演员，换一套道具，写出一个看似熟悉实则完全不同的戏.html",
            excerpt: "",
            tags: ["历史观"]
          },
          {
            kind: "post",
            date: "2026-05-08",
            title: "大道在哪里？",
            file: "2026-05-08-大道在哪里？.html",
            excerpt: "真正的大道在凡尘之间，在世俗之中，在人民的心里。",
            tags: ["大道", "入世"]
          },
          {
            kind: "post",
            date: "2026-03-22",
            title: "鱼生",
            file: "2026-03-22-鱼生.html",
            excerpt: "每个人都是一条鱼，芸芸众鱼，大鱼吃小鱼，小鱼吃虾米，皆是如此，都是一路血腥而来。",
            tags: ["人生观"]
          }
        ]
      },
      {
        key: "dev",
        dir: "dev",
        title: "开发之路",
        kicker: "Path Two · Dev",
        desc: "注重人生的实现，旨在开发人生，包括技术能力、处世方式、职业、工作、生活、生存等等。",
        theme: "dev",
        children: [
          {
            kind: "post",
            date: "2026-11-17",
            title: "AI 时代程序员的核心能力",
            file: "2026-11-17-ai时代程序员的核心能力.html",
            excerpt: "当 AI 写代码的能力越来越强，程序员最该提高的，是把模糊需求变成可验证的正确性标准，并建立证据闭环的能力。",
            tags: ["思考感悟"]
          }
        ]
      }
    ]
  };

  window.CORPATH_TREE = tree;

  // 扁平化：产出标签系统使用的清单
  function flatten() {
    var posts = [];
    function walk(folder, topKey, dirPath) {
      (folder.children || []).forEach(function (node) {
        if (node.kind === "post") {
          posts.push({
            path: topKey,
            date: node.date || "",
            title: node.title || "",
            url: dirPath + "/" + node.file,
            excerpt: node.excerpt || "",
            tags: node.tags || []
          });
        } else if (node.kind === "folder") {
          walk(node, topKey, dirPath + "/" + node.key);
        }
      });
    }
    (tree.children || []).forEach(function (root) {
      walk(root, root.key, root.dir || root.key);
    });
    posts.sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    });
    return posts;
  }
  window.CORPATH_POSTS = flatten();

  // 按目录路径（如 "dev" 或多级路径 "dev/subfolder"）查找文件夹节点
  window.CORPATH_FIND_FOLDER = function (dir) {
    if (!dir) return null;
    var parts = dir.split("/").filter(Boolean);
    var list = tree.children || [];
    var node = null;
    for (var i = 0; i < parts.length; i++) {
      node = null;
      for (var j = 0; j < list.length; j++) {
        if (list[j].key === parts[i]) { node = list[j]; break; }
      }
      if (!node) return null;
      list = node.children || [];
    }
    return node;
  };
})();
