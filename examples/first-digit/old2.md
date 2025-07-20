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

In particular, Wikipedia gives the following frequencies for each leading digit.

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

## The Data

Let's see if we can observe the pattern in
[real-world dataset](https://en.wikipedia.org/wiki/List_of_municipalities_in_Pennsylvania):
the populations of the cities, boroughs, and townships in Pennsylvania.

Wikipedia doesn't give us a way to export table data, but I found a good
[third-party tool](https://wikitable2csv.ggor.de/) that will generate
[CSV files](https://en.wikipedia.org/wiki/Comma-separated_values) from a
Wikipedia article. I used this tool to extract and save the data in the file
[pa-cities.csv](pa-cities.csv).

```ptls --raw --hide --max-height 400
import "text:pa-cities.csv"
```

## Reading digits

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

## Calculating Frequencies

Let's refactor our code into pipeline syntax using the `arg` keyword.

```ptls --no-eval
cities.population[0] | chars(str.of(arg))[0]
```

And use the `$` operator to get the first digit for every population value.

```ptls --max-height 200
cities.population $ chars(str.of(arg))[0]
```

Next, we'll use `list.counts` to get the occurrence count and share for each
value.

```ptls
cities.population
  $ chars(str.of(arg))[0]
  | list.counts
```

We'll remove the `count` column and give the other columns more descriptive
names.

```ptls
cities.population
  $ chars(str.of(arg))[0]
  | list.counts
  | remove("count")
  | table.rename("value", "firstDigit")
  | table.rename("share", "frequency")
```

Now we have the frequency of each starting digit! We can see that the frequency
for each digit decreases as the digits increase

## Tidying Up

Let's see if we can make our frequency values a little more readable. To start,
we'll go back and store our frequency table in a new variable.

```ptls --no-echo
digitStats = cities.population
  $ chars(str.of(arg))[0]
  | list.counts
  | remove("count")
  | table.rename("value", "firstDigit")
  | table.rename("share", "frequency")
```

We can use this new variable to access the values in the `frequency` column as a
list.

```ptls
digitStats.frequency
```

Let's use `$` to convert the frequency values to percents.

```ptls
digitStats.frequency $ arg * 100
```

And round each value to a single decimal place.

```ptls
digitStats.frequency $ roundTo(arg * 100, 1)
```

Finally, we'll put these values back into our table in place of the old
`frequency` column.

```ptls
digitStats.frequency $= roundTo(arg * 100, 1)
```

> ## Syntax Note
>
> Note that the following two syntax forms are equivalent.
>
> ```ptls --no-eval
> digitStats.frequency = digitStats.frequency $ roundTo(arg * 100, 1)
> ```
>
> ```ptls --no-eval
> digitStats.frequency $= roundTo(arg * 100, 1)
> ```

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

## Wrapping Up

Here's the complete code.

```ptls --no-eval
cities = import "csv:pa-cities.csv"

digitStats = cities.population
  $ chars(str.of(arg))[0]
  | list.counts
  | remove("count")
  | table.rename("value", "firstDigit")
  | table.rename("share", "frequency")

digitStats.frequency $= roundTo(arg * 100, 1)

print(digitStats)
```
