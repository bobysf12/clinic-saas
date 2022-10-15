import clsx from "clsx";
import React from "react";

type TitleProps = {
  variant?: "primary" | "secondary";
  as?: React.ElementType;
  className?: string;
  id?: string;
  children: React.ReactNode;
};

const fontSize = {
  h1: "leading-tight text-4xl md:text-5xl",
  h2: "leading-tight text-3xl md:text-4xl",
  h3: "text-2xl font-medium md:text-3xl",
  h4: "text-xl font-medium md:text-2xl",
  h5: "text-lg font-medium md:text-xl",
  h6: "text-lg font-medium",
};

const titleColors = {
  primary: "text-black",
  secondary: "text-gray-400",
};

const Title = ({ as, size, variant = "primary", className, ...rest }: TitleProps & { size: keyof typeof fontSize }) => {
  const Tag = as ?? size;
  return <Tag className={clsx(fontSize[size], titleColors[variant], className)} {...rest} />;
};

export const H1 = (props: TitleProps) => <Title {...props} size="h1" />;
export const H2 = (props: TitleProps) => <Title {...props} size="h2" />;
export const H3 = (props: TitleProps) => <Title {...props} size="h3" />;
export const H4 = (props: TitleProps) => <Title {...props} size="h4" />;
export const H5 = (props: TitleProps) => <Title {...props} size="h5" />;
export const H6 = (props: TitleProps) => <Title {...props} size="h6" />;

type ParagraphProps = {
  className?: string;
  textColorClassName?: string;
  as?: string;
  children: React.ReactNode;
};

export const Paragraph = ({ className, textColorClassName, as = "p", ...props }: ParagraphProps) => {
  return React.createElement(as, {
    className: clsx("max-w-full text-lg", textColorClassName, className),
    ...props,
  });
};
