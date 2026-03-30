interface KenteStripProps {
  height?: string;
}

export function KenteStrip({ height = "h-2" }: KenteStripProps) {
  return (
    <div className={`flex w-full ${height}`}>
      <div className="flex-[2] bg-kente-gold" />
      <div className="flex-1 bg-chitenge" />
      <div className="flex-1 bg-midnight" />
      <div className="flex-1 bg-kente-green" />
      <div className="flex-1 bg-midnight" />
      <div className="flex-[2] bg-kente-gold" />
      <div className="flex-1 bg-ankara-blue" />
      <div className="flex-1 bg-midnight" />
      <div className="flex-1 bg-chitenge" />
      <div className="flex-[2] bg-kente-gold" />
    </div>
  );
}
