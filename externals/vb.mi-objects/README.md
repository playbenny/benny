# vb.mi-dev

Several MaxMSP clones of eurorack modules originally created by 'mutable instruments' https://mutable-instruments.net/ 

Many thanks to Émilie Gillet for making the source code available!
https://github.com/pichenettes/eurorack

**Please note, this is not a release of 'mutable instruments'!**

Volker Böhm, 2019
https://vboehm.net



Compiled versions for macOS can be found here:

https://vboehm.net/downloads (look for vb.mi-objects)



## Building

(Mostly copying from https://github.com/Cycling74/max-devkit ReadMe.md)

0. Clone the code from Github, including submodules: 
   
   ```bash
   git clone --recurse-submodules https://github.com/v7b1/vb.mi-dev.git
   ```
   
1. change directories (cd) into the project folder:

   ```bash
   cd vb.mi-dev
   ```

2. ##### Build libsamplerate

   ```bash
   cd source/libs/libsamplerate
   mkdir build && cd build
   cmake -DLIBSAMPLERATE_EXAMPLES=OFF -DBUILD_TESTING=OFF ..
   cmake --build . --config 'Release'
   cd ../../../..
   ```

3. create a folder with your various build files and step inside:

   ```bash
   mkdir build && cd build
   ```

Now you can generate the projects for your chosen build environment.

### Mac

You can build on the command line using Makefiles, or you can generate an Xcode project and use the GUI to build.

* Xcode: 

  ```bash
  cmake -G Xcode ..
  cmake --build . --config 'Release'
  ```

  or, instead of the second step, open the Xcode project and use the GUI.

* Make: 

  ```bash
  cmake ..
  cmake --build . --config 'Release'
  ```

  Note that the Xcode project is preferrable because it is able to substitute values for e.g. the Info.plist files in your builds.

### Windows

Note: this is untested, but should work something like this:

```bash
cmake ..
cmake --build . --config 'Release'
```

