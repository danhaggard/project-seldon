export default function GuruLayout({
  children,
  modal, // <--- Receive the slot
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
