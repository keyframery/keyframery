<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/keyframery/table"
</script>

<template>
  <div data-demo="table-usage" class="w-full max-w-[420px]">
    <Table>
      <TableHeader>
        <TableRow><TableHead>Invoice</TableHead><TableHead>Amount</TableHead></TableRow>
      </TableHeader>
      <TableBody>
        <TableRow><TableCell>INV-001</TableCell><TableCell>€250.00</TableCell></TableRow>
      </TableBody>
    </Table>
  </div>
</template>
