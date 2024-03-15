export const exportCsv = (
  columns: { header: string; field: string }[],
  data: Record<string, string>[],
  fileName: string,
) =>
  new Promise<void>((resolve) => {
    const CSV_DELIMITER = ';';
    const csvContent = [
      columns
        .map((item) => item.header)
        .map((text) => `"${text}"`)
        .join(CSV_DELIMITER),
      ...data.map((row) =>
        columns
          .map((column) => row[column.field] ?? '')
          .map((text) => `"${text}"`)
          .join(CSV_DELIMITER),
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });

    const element = document.createElement('a');
    element.setAttribute('href', URL.createObjectURL(blob));
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    resolve();
  });
