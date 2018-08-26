# Scheming

This is a prototype scheme interpreter for practice purposes. It exists only to practice/demonstrate the process of building
a simple interpreter for a simple language. 

There are three passes in this interpreter. Pass one converts a raw source file into a stream of tokens. Pass two
then parses those tokens and builds an Abstract Syntax Tree corresponding to some basic scheme constructs. Pass three
then recursively evaluates this AST and returns a value.

The program can only really run the provided sample, but adding more features would be straightforward.
