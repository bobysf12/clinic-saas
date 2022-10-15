import { Card } from "./card";

type Props = {
  goToPrevPage: () => void;
  goToNextPage: () => void;
  page: number;
  pageSize: number;
  totalItems: number;
  pageItems: number;
};

export const PaginationCard = ({ goToNextPage, goToPrevPage, page, pageSize, pageItems, totalItems }: Props) => {
  const firstItemNumber = (page - 1) * pageSize + 1;
  const lastItemNumber = pageItems < totalItems ? firstItemNumber + pageItems - 1 : firstItemNumber + pageSize - 1;
  return (
    <Card className="mt-6">
      <div className="inline-flex space-x-6 mr-6">
        <button onClick={goToPrevPage}>
          <i className="fa-solid fa-chevron-left" />
        </button>
        <button onClick={goToNextPage}>
          <i className="fa-solid fa-chevron-right" />
        </button>
      </div>
      <span>
        {firstItemNumber} - {lastItemNumber} of {totalItems}
      </span>
    </Card>
  );
};
