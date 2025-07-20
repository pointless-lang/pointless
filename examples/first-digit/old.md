# First-Digit Law

> "Benford's law, also known as the Newcomb-Benford law, the law of anomalous
> numbers, or the first-digit law, is an observation that in many real-life sets
> of numerical data, the leading digit is likely to be small. In sets that obey
> the law, the number `1` appears as the leading significant digit about `30%`
> of the time, while `9` appears as the leading significant digit less than `5%`
> of the time. Uniformly distributed digits would each occur about `11.1%` of
> the time."
>
> _-- https://en.wikipedia.org/wiki/Benford's_law_

In particular, Wikipedia gives the following values for the frequencies of each
leading digit.

| Leading Digit | Frequency |
| :-----------: | --------: |
|       1       |     30.1% |
|       2       |     17.6% |
|       3       |     12.5% |
|       4       |      9.7% |
|       5       |      7.9% |
|       6       |      6.7% |
|       7       |      5.8% |
|       8       |      5.1% |
|       9       |      4.6% |

Let's see if we can observe the pattern in real-world dataset:
[the populations](https://en.wikipedia.org/wiki/List_of_municipalities_in_Pennsylvania)
of the cities, boroughs, and townships in Pennsylvania.

Wikipedia doesn't give us a way to export table data, but I found a good
[third-party tool](https://wikitable2csv.ggor.de/) that will generate
[CSV files](https://en.wikipedia.org/wiki/Comma-separated_values) from a
Wikipedia article. I used this tool to extract and save the data in the file
[pa-cities.csv](pa-cities.csv).

```ptls --raw --hide --max-height 400
import "text:pa-cities.csv"
```

We can use the `csv:` import scheme to import the population data as a Pointless
table.

```ptls --max-height 400
cities = import "csv:pa-cities.csv"
```

This table contains `2570` rows and has two columns: `name` and `population`. We
can access the values in the population column as a list.

```ptls --max-height 200
cities.population
```

Our table is sorted by population, so the first value in the column is the
population for Philadelphia, the largest city in the state.

```ptls
cities.population[0]
```

Before we can get the first digit of the number, we need to convert it to a
string.

```ptls
str.of(cities.population[0])
```

Next, we'll convert our number string into a list of characters.

```ptls
chars(str.of(cities.population[0]))
```

And get the first digit character from the list.

```ptls
chars(str.of(cities.population[0]))[0]
```

We can refactor this code into pipeline syntax using the `arg` keyword.

```ptls --no-eval
cities.population[0] | chars(str.of(arg))[0]
```

And use the `$` operator to get the first digit for every row in the table.

```ptls --max-height 200
cities.population $ chars(str.of(arg))[0]
```

Next, we'll use `list.counts` get counts for each value.

```ptls
cities.population
  $ chars(str.of(arg))[0]
  | list.counts
```

And we'll rename the `"value"` column to something more descriptive.

```ptls
cities.population
  $ chars(str.of(arg))[0]
  | list.counts
  | table.rename("value", "firstDigit")
```

Now we have the counts for each starting digit! We can see that the count for
each digit decreases as the digits increase. Let's calculate frequencies for
each digit based on these count.

We'll go back and store this table of counts in a new variable.

```ptls --no-echo
digitStats = cities.population
  $ chars(str.of(arg))[0]
  | list.counts
  | table.rename("value", "firstDigit")
```

Next, we'll access the `count` column as a list and use `list.percents` to get
the frequencies for each count (`list.percents` is a simple wrapper around
`list.normalize` that multiplies each resulting value by `100`).

```ptls
digitStats.count | list.percents
```

We'll use `$` to round each number to a single decimal place.

```ptls
digitStats.count
  | list.percents
  $ roundTo(1)
```

Finally, we'll add these frequencies as a new column in our table.

```ptls
digitStats.frequency = digitStats.count
  | list.percents
  $ roundTo(1)
```

Our calculated frequencies match the expected values quite well!

| Leading Digit | Calculated | Expected |
| ------------- | ---------: | -------: |
| 1             |      31.2% |    30.1% |
| 2             |      18.0% |    17.6% |
| 3             |      11.8% |    12.5% |
| 4             |      10.0% |     9.7% |
| 5             |       7.6% |     7.9% |
| 6             |       5.8% |     6.7% |
| 7             |       5.6% |     5.8% |
| 8             |       5.3% |     5.1% |
| 9             |       4.7% |     4.6% |

Here's the final code.

```ptls --no-eval
cities = import "csv:pa-cities.csv"

digitStats = cities.population
  $ chars(str.of(arg))[0]
  | list.counts
  | table.rename("value", "firstDigit")

digitStats.percent = digitStats.count
  | list.percents
  $ roundTo(1)

print(digitStats)
```
