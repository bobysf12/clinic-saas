import clsx from "clsx";
import { HTMLAttributes, TdHTMLAttributes } from "react";
import { Card } from "./card";

export const TableContainer = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <Card className={clsx("p-0 overflow-x-auto", className)} {...props} />;
};

export const Table = ({ className, ...props }: HTMLAttributes<HTMLTableElement>) => {
  return <table className={clsx("text-sm text-left text-gray-500 ", className)} {...props} />;
};

export const TableHead = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => {
  return <thead className={clsx("text-xs text-gray-700 uppercase bg-gray-5", className)} {...props} />;
};
export const TableHeadRow = (props: HTMLAttributes<HTMLTableRowElement>) => {
  return <tr {...props} />;
};

export const TableBody = (props: HTMLAttributes<HTMLTableSectionElement>) => {
  return <tbody {...props} />;
};
export const TableBodyRow = ({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) => {
  return <tr className={clsx("border-b", className)} {...props} />;
};

export const TableCol = ({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) => {
  return <td className={clsx("px-4 py-2", className)} {...props} />;
};
