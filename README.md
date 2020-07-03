## Pointless: A Scripting Language for Learning and Fun (v0.1.0)

[![sample code](screenshot.png)](https://ptls.dev)

**Documentation**: [https://ptls.dev/docs.html](https://ptls.dev/docs.html)

**Examples**: [https://ptls.dev/examples.html](https://ptls.dev/examples.html)

**Installation**: [https://ptls.dev/install.html](https://ptls.dev/install.html)

**Tutorials**: [https://ptls.dev/tutorials](https://ptls.dev/tutorials)

**Try Pointless Online!**: [https://ptls.dev/online](https://ptls.dev/online)

[**Why Learn Pointless?**](#why-learn-pointless)

[**Development**](#development)

## Why Learn Pointless?
#### Avery N. Nortonsmith

What language should beginner programmers learn? Pointless, of course!

Here's the deal: I like the way that writing programs in scripting languages (like Python) tends to feel -- *easy and flexible* -- and I like the types of programs that functional languages (like Haskell) are designed to produce -- *declarative and correct*. But Python and Haskell are *very* different languages -- is there a middle-ground between the two? Pointless aims to provide just this.

### Comparison with Scripting Languages: *includes languages like Python and Javascript*

Scripting languages are often seen as flexible and easy to use. My own experience has show me that languages which are *easy to use* also make it *easy to write bad programs*. One of the primary goals of Pointless is to use language design to encourage good software engineering practices, without sacrificing convenience or usability to the extent that I believe that existing statically-typed functional languages languages do.

**Correct Code vs Good Code**

Consider this piece of Python code that I wrote many years back in an intro programming class. Is it obvious what the function does?

```
def mostRepeatedChar(chars):
    currentLen = maxLen = 0
    lastChar = None

    for c in chars:
        if c == lastChar:
            currentLen += 1
        else:
            lastChar = c
            currentLen = 1
        maxLen = max(maxLen, currentLen)
    return maxLen
```
Here's an implementation of the same function in Pointless:

```
mostRepeatedChar(chars) =
  chars
  |> groupBy(equals)
  |> map(length)
  |> maximum
```

The original function specification:

> "Given a list of characters, find sequences of a single repeated character. The repeats need to be consecutive. Return the length of the longest such sequence."

I'm happier with the Pointless solution than with my original Python code. The Pointless code reads like the original problem specification: it takes a list of characters, finds the groups of equal consecutive elements, gets the length of each group and returns the maximum length.  The Python code, with its explicit iteration and intermediate variables, spends more time focusing on the *how* than the *what*, and, in my view, obscures the original intent of the problem.

As a beginner, I could have used Python to write a more declarative, functional solution to this problem. But I didn't, because Python -- like most dynamic, imperative languages -- doesn't encourage that type of programming, despite supporting it. Functional programming is not a panacea, and Pointless is not impose the paradigm absolutely; rather, the constraints that the language does impose are intended to guide programmers towards more concise and modular solutions, without feeling like impediments.  

### Comparison with Statically-Typed Functional Languages: *includes languages like Haskell and OCaml*

In my experience, languages in the ML family do the most to make writing pure, declarative code feel natural. At the same time, the syntax, type-systems, and breadth of features that these languages provide can feel overwhelming and impeding. 

**Syntax**

Syntactically, Haskell and OCaml feel like anti-lisps: whitespace, rather than parentheses, designates function calls. This behavior, combined with ability to define custom operators, can lead to dense, symbol-heavy syntax, as seen in the popular Haskell [lens](https://github.com/ekmett/lens/blob/master/src/Control/Lens/Lens.hs#L1213) library:

```
(<<<>=) :: (MonadState s m, Monoid r) => LensLike' ((,) r) s r -> r -> m r
l <<<>= b = l %%= \a -> (a, a `mappend` b)
{-# INLINE (<<<>=) #-}
```

**Type-Inference**

The type-inference capabilities of Haskell and OCaml are powerful, but they can still fail in surprising ways -- for example, when passing [polymorphic functions as arguments](https://stackoverflow.com/questions/36587571/confusing-about-haskell-type-inference) in Haskell:

```
identity x = x
toPair func a b = (func a, func b)
main = putStrLn $ show (toPair identity "adsf" 123)
```

```
test.hs:8:48: error:
    • No instance for (Num [Char]) arising from the literal ‘123’
    • In the third argument of ‘toPair’, namely ‘123’
      In the first argument of ‘show’, namely
        ‘(toPair identity "adsf" 123)’
      In the second argument of ‘($)’, namely
        ‘show (toPair identity "adsf" 123)’
  |
8 | main = putStrLn $ show (toPair identity "adsf" 123)
```

In cases like this, Haskell requires programmers to enable the `RankNTypes` extension and provide type-annotations in order to satisfy the type-checker. OCaml does not support higher-rank types, and cannot accommodate programs like this.

**Language Complexity**

Haskell and OCaml are huge projects built on decades of research and work, and Pointless can only hope to offer a fraction of their capabilities. However, these capabilities come at a cost: if I wanted to thoroughly understand Haskell and OCaml, I would have to understand monads, inheritance, variance, exceptions, modules, type-classes, higher-kinded and higher-rank types, and many more complex concepts.

At a certain level of conceptual complexity, languages don't just become difficult to learn -- they also become difficult to teach. This effect is, in my view, exemplified by Haskell's monadic effect-system, where a beginner Haskell programmer seeking to understand monadic IO could encounter both statements like this (emphasis mine):

>"When we teach beginners about Haskell, one of the things we handwave away is how the IO monad works. Yes, it’s a monad, and yes, it does IO, but **it’s not something you can implement in Haskell itself**, giving it a somewhat **magical quality**." [*Unraveling the mystery of the IO monad - Edward Z. Yang*](http://blog.ezyang.com/2011/05/unraveling-the-mystery-of-the-io-monad/)

and ones like this:

>"As Haskellers worth their salt know, **the IO monad is not special** ... I’d recommend Haskell intermediates (perhaps not newbies) to **implement their own IO monad** as a free monad, or as an mtl transformer, partly for the geeky fun of it, and partly for the insights." [*Pure IO monad and Try Haskell - Chris Done*](https://chrisdone.com/posts/pure-io-tryhaskell/)

The confusion around monadic IO has been fueled by the vast number of tutorials, articles, and papers written on the subject, many of which are based on incomplete or misleading analogies and examples. This hand-wavy inattention to detail has made my own experience learning Haskell much more confusing and frustrating than it ought to have been.

In designing Pointless, I have therefore tried my best to balance accessibility and rigor, in order to create a language which is both easy to use and easy to understand.

### Comparison with Lisps

This category includes many languages, which to me represent the other end of the functional programming spectrum from the ML-derivatives. As these languages emphasize extensibility, it is difficult to say exactly what they are or are not -- however, I do see high-level areas where the strengths of these languages differ from those of Pointless.

I tend to think of programs in Pointless as a series of transformations, where executing a program involves applying these transformations to some starting data. Pointless facilitates this programming style through its pipeline operator `|>` and syntactic support for partial application. In contrast, I picture constructing and running a Lisp program as traversing a tree, which I believe comes both from the S-expression based syntax that Lisps share, and from Lisps' deeper lack of separation between code and data.

The *R5RS* report describes Scheme, a prominent Lisp variant, as follows:

>"It was designed to have an exceptionally clear and simple semantics and few different ways to form expressions. A wide variety of programming paradigms, including imperative, functional, and message passing styles, find convenient expression in Scheme." [11]

Here I see the biggest difference between Lisps and Pointless: Lisps provide a small, flexible set of building-blocks with which a programmer can use and extend the language to their liking. While Pointless also focuses on simplicity, its core features are designed to produce a programming environment which is tailored, rather than extensible.

### Designing Pointless

I believe that these examples show that there is room for improvement -- that we can design a programming language for beginners to learn which is intuitive and unobtrusive while simultaneously encouraging programmers to model and solve problems at a *high level* -- the *what*, rather than the *how*.

A major influence on my approach to language design is the essay [*Less is more: language features*](https://blog.ploeh.dk/2015/04/13/less-is-more-language-features) by Mark Seemann, who claims that:

> "Many languages have redundant features; progress in language design includes removing those features."

While Pointless explores some original ideas, the language doesn't introduce any revolutionary paradigms or capabilities. Rather, Pointless focuses on crafting a user experience (with users being programmers), which largely involves paring-down and distilling existing language concepts. As such, the Pointless language is very much a *design project* -- with abstract, high-level goals -- which raises the question: how should these goals be defined, and the results evaluated?

Crista Videira Lopes addresses this question in her essay [*Research in Programming Languages*](http://tagide.com/blog/academia/research-in-programming-languages
):

> "In that dreadful part of a topic proposal where the committee asks the student 'what are your claims?' the student should probably answer 'none of interest.' In experimental design research, one can have hopes or expectations about the effects of the system, and those must be clearly articulated, but very few certainties will likely come out of such type of work." [2]

I created Pointless to help beginners learn, but with programming language design, there are no certainties. Why should beginners learn Pointless? Try it, and see for yourself!

## Development

Pointless 0.1.0 brings a number of changes from the initial release, informed by feedback and experience. The latest implementation of Pointless is interpreted, rather than compiled, and is written in Dart. This move marks a deemphasis on performance with a focus instead on improved language design and faster development. It's my hope that the new Dart-based implementation will make Pointless easier for others to install, use, and modify.

#### New utilities:

- A repl for interactive programming
- An web-based language playground
- Auto-generated API docs for prelude functions

#### Language updates:

- Syntax consolidation and updates
- Better error messages with location information for incorrect types
  (showing where in the code the incorrect type came from)
- Explicit exports for multi-file projects
- Expanded standard library
- Try / catch error handling mechanism
- Support for labeled objects

#### Implementation updates:

- A smaller, easier to edit codebase
- Improved Windows support
- Bug fixes
- MIT licensed source code

#### Site updates:

- Updated documentation
- More in-depth examples
- Automatic syntax highlighting
- Faster loading

### Installation

You can [try Pointless online](https://ptls.dev/online) without installing.  
To install Pointless locally, you'll need to have [Git](https://git-scm.com/downloads) installed to clone the repository, as well as the [Dart SDK](https://dart.dev/get-dart).

Installing on Linux, Mac and Windows (PowerShell):

1. Clone the repository

    ```
    git clone https://github.com/pointless-lang/pointless.git
    ```

2. Enter the repo directory

    ```
    cd pointless
    ```

3. Download Dart dependencies:

    ```
    pub get
    ```

4.  You can now run the Pointless repl using:

    ```
    dart lib/pointless.dart
    ```

    or supply a path to a file to run; for example:

    ```
    dart lib/pointless.dart examples/beer/beer.ptls
    ```

    (for repl readline support, try [rlwrap](https://github.com/hanslub42/rlwrap)) 

### Compiling the interpreter with dart2native:

Compiling the interpreter avoids the startup overhead of the Dart VM.

After performing the steps above:

- Linux and Mac:

    Run the following commands in the repository root (generates ./bin/pointless):
  
    ```
    dart2native lib/pointless.dart -o bin/pointless
    ```

    Alternatively, using Make, simply run:

    ```
    make
    ```

    Now you can run Pointless like this:

    ```
    bin/pointless examples/beer/beer.ptls
    ```

- Windows:

    Run the following commands in the repository root (generates ./bin/pointless.exe):

    ```
    dart2native lib/pointless.dart -o bin/pointless.exe
    ```

    Now you can run Pointless like this:

    ```
    bin/pointless.exe examples/beer/beer.ptls
    ```

Contributions are welcome!
