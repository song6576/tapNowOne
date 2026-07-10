/** 企业版合作伙伴 Logo 跑马灯 */
export function EnterpriseMarquee({ logos }: { logos: { name: string; label: string }[] }) {
  const track = [...logos, ...logos]
  return (
    <div className="enterprise-marquee" aria-hidden>
      <div className="enterprise-marquee-track">
        {track.map((logo, i) => (
          <span key={`${logo.name}-${i}`} className="enterprise-marquee-item">
            {logo.label}
          </span>
        ))}
      </div>
    </div>
  )
}
