"use client";

import { Pencil, PieChart, Plus } from "lucide-react";
import { RowsSkeleton } from "@/components/admin/invest/shared/table-skeleton";
import { Money } from "@/components/shared/money";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, QueryError } from "@/components/shared/query-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInvestPortfolios } from "@/hooks/admin-invest/useInvestPortfolios";
import { RISK_LABELS } from "@/lib/invest";
import { DeletePortfolioButton } from "./delete-portfolio-button";
import { PortfolioFormModal } from "./portfolio-form-modal";

export function PortfoliosView() {
  const { data, isPending, isError, refetch } = useInvestPortfolios();

  const newButton = (
    <PortfolioFormModal>
      <Button size="lg">
        <Plus data-icon="inline-start" />
        New portfolio
      </Button>
    </PortfolioFormModal>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Portfolios"
        description="Fixed mixes of coins that customers can invest in. Customers only see published portfolios."
        actions={newButton}
      />
      {isError ? (
        <QueryError message="We couldn't load portfolios." onRetry={() => void refetch()} />
      ) : isPending ? (
        <RowsSkeleton />
      ) : data.length === 0 ? (
        <EmptyState icon={<PieChart />} title="No portfolios yet" description="Create a mix of coins, then publish it for customers." action={newButton} />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Portfolio</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Mix</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Investors</TableHead>
                <TableHead className="text-right">Value held</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((portfolio) => (
                <TableRow key={portfolio.id}>
                  <TableCell className="py-3 pl-4">
                    <span className="block font-medium">{portfolio.name}</span>
                    <span className="block max-w-64 truncate text-xs text-muted-foreground">{portfolio.summary}</span>
                  </TableCell>
                  <TableCell>{RISK_LABELS[portfolio.risk]}</TableCell>
                  <TableCell className="text-xs tabular-nums text-muted-foreground">
                    {portfolio.allocations.map((item) => `${item.symbol} ${item.weightBps / 100}%`).join(" · ")}
                  </TableCell>
                  <TableCell>
                    {portfolio.published ? (
                      <Badge variant="outline" className="border-credit/40 text-credit">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Draft
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{portfolio.investors}</TableCell>
                  <TableCell className="text-right">
                    <Money amount={portfolio.value} currency="USD" />
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <PortfolioFormModal portfolio={portfolio}>
                        <Button variant="ghost" size="sm">
                          <Pencil data-icon="inline-start" />
                          Edit
                        </Button>
                      </PortfolioFormModal>
                      {portfolio.investors === 0 ? (
                        <DeletePortfolioButton portfolio={portfolio} />
                      ) : (
                        <span className="max-w-40 text-xs text-muted-foreground">Held by customers. Unpublish it to hide it.</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
