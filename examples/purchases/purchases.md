https://www.sumsar.net/blog/pandas-feels-clunky-when-coming-from-r/

```ptls
purchases = import "csv:purchases.csv"
```

```ptls
sum(purchases.amount)
```

```ptls
fn calcTotal(group)
  { total: sum(group.amount) }
end

Table.summarize(purchases, "country", calcTotal)
```

```ptls
fn calcTotal(group)
  total = group
    $ arg.amount - arg.discount
    | sum

  { total }
end

Table.summarize(purchases, "country", calcTotal)
```

```ptls
median = List.median(purchases.amount)

purchases
  ? arg.amount <= median * 10
  | Table.summarize("country", calcTotal)
```

```ptls
fn calcTotal(group)
  threshold = List.median(group.amount) * 10

  total = group
    ? arg.amount <= threshold
    $ arg.amount - arg.discount
    | sum

  { total }
end

Table.summarize(purchases, "country", calcTotal)
```
