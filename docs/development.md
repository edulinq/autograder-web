# Development Notes

## Arrow Functions

This projet heavily prefers the use of the `function` keyword over the use of
[arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions).
Arrow functions may only be used for one line callbacks.
If the RHS of the arrow function is more than a single expression,
use the `function` keyword instead.
Both the RHS and LHS of the arrow must be wrapped in parentheses.

Consider the following cases:
```javascript
// Good: One line, parentheses on both sides.
numbers.map((number) => (number * 2));

// Bad: Missing parentheses on both sides.
numbers.map(number => number * 2);

// Bad: Missing parentheses on RHS.
numbers.map((number) => number * 2);

// Bad: Using multiple lines.
numbers.map((number) => {
    return (number * 2);
});
```
