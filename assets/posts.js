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

  // 两条路共享的总述：阐释「你中有我、殊途同归」的关系
  var COMMON_DESC = "人生之路向内，记录经历之后的思考与感悟，以及实践之后的总结；开发之路向外，记录技术、代码与工程中的探索。但人生里处处需要开发——开发心智、开发关系、开发可能性；开发也从来不止于代码，它同样是在开发人生。两条路如同阴阳双鱼盘旋交错，你中有我、我中有你，看似分流，其实殊途同归，本就是同一条。";

  var tree = {
    children: [
      {
        key: "life",
        dir: "life",
        title: "人生之路",
        kicker: "Path One · Life",
        desc: COMMON_DESC + " 在人生之路这一侧，我把活着这件事，慢慢想明白一点。",
        theme: "life",
        children: [
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
        desc: COMMON_DESC + " 在开发之路这一侧，我把复杂的事情，拆成可验证的证据。",
        theme: "dev",
        children: [
          {
            kind: "post",
            date: "2026-11-17",
            title: "AI 时代程序员的核心能力",
            file: "2026-11-17-ai时代程序员的核心能力.html",
            excerpt: "当 AI 写代码的能力越来越强，程序员最该提高的，是把模糊需求变成可验证的正确性标准，并建立证据闭环的能力。",
            tags: ["思考感悟"]
          },
          {
            kind: "folder",
            key: "demo",
            title: "示例子目录",
            kicker: "Demo · 子目录",
            desc: "用于演示「文章与子文件夹同级展示」的示例目录，可随时删除。",
            theme: "dev",
            children: [
              {
                kind: "post",
                date: "2026-11-16",
                title: "示例：子目录里的一篇文章",
                file: "2026-11-16-示例子目录里的文章.html",
                excerpt: "这篇示例文章用于演示标签如何跨目录聚合，删除示例目录时一并删除即可。",
                tags: ["思考感悟"]
              }
            ]
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

  // 按目录路径（如 "dev" 或 "dev/demo"）查找文件夹节点
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
