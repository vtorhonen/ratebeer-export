# ratebeer-export

NodeJS module for exporting ratings from your own Ratebeer account.

Requires a Ratebeer premium account, as 'compile my ratings' feature
is available only for paying customers.

# TODO

This is very much under construction. Couple of notes though:

- Finish CSV parsing.
- Enable callback for `get_ratings()`, so the data can be stored Somewhere Else very easily, such as Redis.
- Publish this thing on NPM so others can use this.
