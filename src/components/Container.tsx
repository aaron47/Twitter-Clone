interface Props {
  children: React.ReactNode;
  classNames?: string;
}

const Container: React.FC<Props> = ({ children, classNames }) => {
  return (
    <div className={`m-auto max-w-xl bg-slate-400 ${classNames}`}>
      {children}
    </div>
  );
};

export default Container;
