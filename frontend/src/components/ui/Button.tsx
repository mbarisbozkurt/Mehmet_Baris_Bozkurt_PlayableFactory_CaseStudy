import { Button as AntButton, ButtonProps } from 'antd';

interface Props extends ButtonProps {
  className?: string;
}

export const Button = ({ children, ...props }: Props) => {
  return (
    <AntButton {...props}>
      {children}
    </AntButton>
  );
};