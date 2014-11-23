SUITESRC = JSON-Schema-Test-Suite/tests/draft4
SUITEOPTSRC = JSON-Schema-Test-Suite/tests/draft4/optional
SUITEREMSRC = JSON-Schema-Test-Suite/remotes
SUITEDST = test/suite
SUITEREMDST = test/remotes

SUITEFILES = $(wildcard $(SUITESRC)/*.json)
SUITEJSON = $(notdir $(SUITEFILES))
SUITEJS = $(addsuffix .js, $(basename $(SUITEJSON)))
SUITEDSTFILES = $(SUITEJS:%.js=$(SUITEDST)/%.js)

SUITEOPTFILES = $(wildcard $(SUITEOPTSRC)/format.json)
SUITEOPTJSON = $(notdir $(SUITEOPTFILES))
SUITEOPTJS = $(addsuffix .js, $(basename $(SUITEOPTJSON)))
SUITEOPTDSTFILES = $(SUITEOPTJS:%.js=$(SUITEDST)/%.js)

build: components index.js $(SUITEDSTFILES) $(SUITEOPTDSTFILES) $(SUITEREMDST)
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

$(SUITEREMDST): $(SUITEREMSRC)
	@cp -r "$<" "$@"

clean:
	rm -fr build components template.js $(SUITEREMDST) $(SUITEDST)

.PHONY: clean
