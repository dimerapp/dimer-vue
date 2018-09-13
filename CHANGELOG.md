<a name="2.0.1"></a>
## [2.0.1](https://github.com/dimerapp/dimer-vue/compare/v2.0.0...v2.0.1) (2018-09-13)


### Features

* **routes:** allow registering an array of docs ([6b919e4](https://github.com/dimerapp/dimer-vue/commit/6b919e4))


### BREAKING CHANGES

* **routes:** remove makeUrl from the version instance, since with an array of docs, it's not
possible to find the doc route and make a proper url



<a name="2.0.0"></a>
# [2.0.0](https://github.com/dimerapp/dimer-vue/compare/v1.0.3...v2.0.0) (2018-09-11)


### Bug Fixes

* **getActiveDimer:** use current route match path ([5a31e78](https://github.com/dimerapp/dimer-vue/commit/5a31e78))
* **search:** use this.$activeDimer vs this.$dimer to search ([c0fb5d5](https://github.com/dimerapp/dimer-vue/commit/c0fb5d5))


### Code Refactoring

* improve the logic of finding activeDimer and caching it ([f87d195](https://github.com/dimerapp/dimer-vue/commit/f87d195))


### Features

* **version:** share zone object with the version instance vs just slug ([fa79e60](https://github.com/dimerapp/dimer-vue/commit/fa79e60))


### BREAKING CHANGES

* removed utils.getActiveDimer in favour of $dimer.isDocRoute and
$dimer.getClosestZoneAndVersion



<a name="1.0.3"></a>
## [1.0.3](https://github.com/dimerapp/dimer-vue/compare/v1.0.2...v1.0.3) (2018-09-10)


### Features

* **version:** cache response for getTree ([c34b13e](https://github.com/dimerapp/dimer-vue/commit/c34b13e))



<a name="1.0.2"></a>
## [1.0.2](https://github.com/dimerapp/dimer-vue/compare/v1.0.1...v1.0.2) (2018-09-10)


### Bug Fixes

* **activeDimer:** define setter on activeDimer to avoid nuxt errors ([59ad4ef](https://github.com/dimerapp/dimer-vue/commit/59ad4ef))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/dimerapp/dimer-vue/compare/v1.0.0...v1.0.1) (2018-09-10)


### Features

* **activeDimer:** inject activeDimer when using vue router ([46db614](https://github.com/dimerapp/dimer-vue/commit/46db614))



<a name="1.0.0"></a>
# 1.0.0 (2018-09-09)


### Features

* initial working commit ([84df5fe](https://github.com/dimerapp/dimer-vue/commit/84df5fe))
* **tabs:** add the tabs component ([7d76436](https://github.com/dimerapp/dimer-vue/commit/7d76436))


