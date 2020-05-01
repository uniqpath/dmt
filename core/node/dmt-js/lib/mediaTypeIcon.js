function mediaTypeIcon(mediaType) {
  switch (mediaType) {
    case 'photo':
      return '';
    case 'music':
      return '♬';
    case 'video':
      return '';
    default:
      return '';
  }
}

export default mediaTypeIcon;
