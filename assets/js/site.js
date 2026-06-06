// 外部リンクを別タブで開くようにする
document.querySelectorAll('.markdown-body a').forEach(function(link) {
  if (link.hostname !== location.hostname) {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  }
});
