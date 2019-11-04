# Unmanaged Libraries

This folder contains libraries that were unable to be imported via package managers or needed 
a custom build to work with our current tech stack.

## d3
- Needed a version of D3 that included D3.layout that was AMD compatible.

## jQuery UI
- The tooltips conflict with bootstrap's tooltips
- Bootstraps tooltips are much nicer <small>(They don't feel sluggish and it's easier to theme)</small>
- It's starting to show its age in some parts (See above).
