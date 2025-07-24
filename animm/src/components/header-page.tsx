export function HeaderPage(props: any) {
  return (
    <div className="w-full flex flex-row p-4">
      <div className="w-full">
        <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
          {props.title}
        </h1>
      </div>
    </div>
  );
}
