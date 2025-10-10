# <img src="https://raw.githubusercontent.com/pointless-lang/pointless-lang.github.io/master/static/icons/icon.svg" alt="Pointless logo" height=28> Pointless

**A Language for Learning**

```ptls
fn step(n)
  if n % 2 == 0 then n / 2 else n * 3 + 1 end
end

fn hailstone(n)
  values = [n]

  while n > 1 do
    n |= step
    values |= push(n)
  end

  values
end

bars = chars("▁▂▃▄▅▆▇█")

fn getBar(n, maxVal)
  scaled = 8 * (n - 1) / (maxVal - 1)
  bars[Math.min(Math.floor(scaled), 7)]
end

fn chart(values)
  values
    $ getBar(max(values))
    | join("")
end

hailstone(78)
  | chart
  | print
```

```
▃▂▄▂▅▃█▄▂▆▃█▄▂▁▁▂▁▃▂▁▁▁▁▂▁▁▂▁▁▁▁▁▁▁▁
```

## Installing

Using [Node.js with npm](https://nodejs.org/en/download):

```
npm install --global https://github.com/pointless-lang/pointless/
```
