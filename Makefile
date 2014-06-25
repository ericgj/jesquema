SUITESRC = JSON-Schema-Test-Suite/tests/draft4
SUITEOPTSRC = JSON-Schema-Test-Suite/tests/draft4/optional
SUITEDST = test/suite

SUITEFILES = $(wildcard $(SUITESRC)/*.json)
SUITEJSON = $(notdir $(SUITEFILES))
SUITEJS = $(addsuffix .js, $(basename $(SUITEJSON)))
SUITEDSTFILES = $(SUITEJS:%.js=$(SUITEDST)/%.js)

SUITEOPTFILES = $(wildcard $(SUITEOPTSRC)/format.json)
SUITEOPTJSON = $(notdir $(SUITEOPTFILES))
SUITEOPTJS = $(addsuffix .js, $(basename $(SUITEOPTJSON)))
SUITEOPTDSTFILES = $(SUITEOPTJS:%.js=$(SUITEDST)/%.js)

build: components index.js $(SUITEDSTFILES) $(SUITEOPTDSTFILES)
	@component build --dev

components: component.json
	@component install --dev

$(SUITEDST)/%.js: $(SUITESRC)/%.json
	@mkdir -p $(SUITEDST)
	@echo "window['json-schema-test-suite']['$(basename $(notdir $@))'] = " > $@ 
	@cat "$<"  >> $@
	@echo ";" >> $@

$(SUITEDST)/%.js: $(SUITEOPTSRC)/%.json
	@mkdir -p $(SUITEDST)
	@echo "window['json-schema-test-suite']['$(basename $(notdir $@))'] = " > $@ 
	@cat "$<"  >> $@
	@echo ";" >> $@

clean:
	rm -fr build components template.js $(SUITEDST)

.PHONY: clean
