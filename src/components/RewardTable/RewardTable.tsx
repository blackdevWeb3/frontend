import React, { FC } from "react";
import {
  TableWrapper,
  Wrapper,
  Title,
  EmptyRow,
  TableHeadRow,
  TableBody,
  TableRow,
} from "./RewardTables.styles";
import { ICell, IRow } from "components/Table/Table";
interface TxTableIRow extends IRow {
  onClick?: () => void;
}

interface Props {
  rows: TxTableIRow[];
  headers: ICell[];
  title?: string;
  scrollable: boolean;
  emptyMessage: string;
  isLoading?: boolean;
}

const RewardMyPoolsTable: FC<Props> = ({
  rows,
  headers,
  title,
  scrollable = true,
  isLoading,
  emptyMessage,
}) => {
  return (
    <Wrapper data-cy="rewards-table">
      {title && <Title>{title}</Title>}
      <TableWrapper scrollable={scrollable}>
        <TableHeadRow>
          {headers.map((cell, idx) =>
            typeof cell.value === "string"
              ? cell.value
              : React.cloneElement(cell.value, { key: idx })
          )}
        </TableHeadRow>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row, ridx) => {
              return (
                <TableRow key={ridx}>
                  {row.cells.map((cell, idx) =>
                    typeof cell.value === "string"
                      ? cell.value
                      : React.cloneElement(cell.value, { key: idx })
                  )}
                  {(row as any).explorerLink}
                </TableRow>
              );
            })
          ) : (
            <EmptyRow>{isLoading ? "Loading..." : emptyMessage}</EmptyRow>
          )}
        </TableBody>
      </TableWrapper>
    </Wrapper>
  );
};

export default RewardMyPoolsTable;
