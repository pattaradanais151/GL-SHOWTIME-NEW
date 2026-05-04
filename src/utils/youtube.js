export const getYoutubeThumbnail = (url) => {
  if (!url) return 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=No+Cover';
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  
  return videoId 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` 
    : 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=Invalid+Link';
};