export default function Logo({ size = 24, showWordmark = true }) {
  return (
    <div className="logo">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13.2 1L3 13.5H10.4L9.6 23L21 9.5H13.6L13.2 1Z"
          fill="var(--primary)"
        />
      </svg>
      {showWordmark && <span className="logo__wordmark">Breifora</span>}
    </div>
  );
}
