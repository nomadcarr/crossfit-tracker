export default function Avatar({ name, url, size = 40 }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: size * 0.42,
    color: '#fff',
    background: 'linear-gradient(135deg, var(--red), var(--red2))',
    overflow: 'hidden',
  };

  if (url) {
    return <img src={url} alt={name} style={{ ...style, objectFit: 'cover' }} />;
  }
  return <div style={style}>{initial}</div>;
}
