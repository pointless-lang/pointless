# Pointless

### A scripting language for learning and fun

I've made this site to share a project I've been working on intermittently for the last couple of years - a programming language called Pointless. The language is a distillation of some of the concepts from functional programming that I find interesting, with a design goal that can be roughly summarized as "creating the programming language that I'd like to have learned as a beginner programmer". This language is still very much in-the-works, but I'm excited to share the progress that I've made so far. More information can be found in the examples and documentation sections. - Avery Nortonsmith

### Documentation and examples at [https://ptls.dev](https://ptls.dev/)
### [Development goals](https://github.com/pointless-lang/pointless/projects/1)
  
![sample code](screenshot.png)


### Installation
#### Linux and Mac

You'll need to have both git and Make installed, as well as a C compiler**:

![https://stackoverflow.com/questions/10265742/how-to-install-make-and-gcc-on-a-mac
](https://stackoverflow.com/questions/10265742/how-to-install-make-and-gcc-on-a-mac)  
![https://linuxize.com/post/how-to-install-gcc-compiler-on-ubuntu-18-04/](https://linuxize.com/post/how-to-install-gcc-compiler-on-ubuntu-18-04/)  
![https://git-scm.com/downloads](https://git-scm.com/downloads)

1. Clone the repository
```
git clone https://github.com/pointless-lang/pointless.git
```

2. Enter the repo directory
```
cd pointless
```
3. Build the project with GCC*
```
make opt -B
```
4. Test the build with a [hello world](https://ptls.dev/docs.html#helloworld) script

*To use a compiler other than GCC
```
make CC=clang opt -B
```

**If you're on linux (or WSL on windows), you may find that the binary in the repo (built for Ubuntu 18.04) works out-of-the-box. You can test this by replacing step 3 above with the following command

```
chmod 755 pointless
```

#### Windows

You can try Pointless on windows by installing the Windows Subsystem for Linux (WSL) and using it to run the commands above.
