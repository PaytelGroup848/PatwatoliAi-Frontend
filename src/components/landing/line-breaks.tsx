export function LineBreaks({ text }: { text: string }) {
  const parts = text.split('<br>');

  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 ? <br /> : null}
        </span>
      ))}
    </>
  );
}
