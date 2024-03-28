#### GOAL MAKE MONEY

# Only Owners table 

run slither contracts/TestContract.sol --print modifiers --json modifiers.json 

access results.printers.elements[-1] 
or itereate and check for e.name.name == "XTwitter" ? contact name

modifiers are in 
e.name.content.rows:[
    [
    "owner",
     []
    ],
    [
      "renounceOwnership",
      [
        "onlyOwner"
      ]
    ],
]

only focus on [x[name,[mod] WHERE mod != null]]