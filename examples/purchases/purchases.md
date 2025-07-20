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

table.summarize(purchases, "country", calcTotal)
```

```ptls
fn calcTotal(group)
  total = group
    $ arg.amount - arg.discount
    | sum

  { total }
end

table.summarize(purchases, "country", calcTotal)
```

```ptls
median = list.median(purchases.amount)

purchases
  ? arg.amount <= median * 10
  | table.summarize("country", calcTotal)
```

```ptls
fn calcTotal(group)
  threshold = list.median(group.amount) * 10

  total = group
    ? arg.amount <= threshold
    $ arg.amount - arg.discount
    | sum

  { total }
end

table.summarize(purchases, "country", calcTotal)
```
