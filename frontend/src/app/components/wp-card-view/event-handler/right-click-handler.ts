import {Injector} from '@angular/core';
import {CardEventHandler} from "core-components/wp-card-view/event-handler/card-view-handler-registry";
import {WorkPackageCardViewComponent} from "core-components/wp-card-view/wp-card-view.component";
import {WorkPackageTableSelection} from "core-components/wp-fast-table/state/wp-table-selection.service";
import {uiStateLinkClass} from "core-components/wp-fast-table/builders/ui-state-link-builder";
import {debugLog} from "core-app/helpers/debug_output";
import {WorkPackageCardViewService} from "core-components/wp-card-view/services/wp-card-view.service";
import {OpWorkPackageContextMenu} from "core-components/op-context-menu/wp-context-menu/wp-table-context-menu.directive";
import {OPContextMenuService} from "core-components/op-context-menu/op-context-menu.service";

export class CardRightClickHandler implements CardEventHandler {

  // Injections
  public wpTableSelection:WorkPackageTableSelection = this.injector.get(WorkPackageTableSelection);
  public wpCardView:WorkPackageCardViewService = this.injector.get(WorkPackageCardViewService);
  public opContextMenu:OPContextMenuService = this.injector.get(OPContextMenuService);

  constructor(public readonly injector:Injector,
              card:WorkPackageCardViewComponent) {
  }

  public get EVENT() {
    return 'contextmenu.cardView.rightclick';
  }

  public get SELECTOR() {
    return `.wp-card`;
  }

  public eventScope(card:WorkPackageCardViewComponent) {
    return jQuery(card.container.nativeElement);
  }

  public handleEvent(card:WorkPackageCardViewComponent, evt:JQueryEventObject) {
    let target = jQuery(evt.target);

    // We want to keep the original context menu on hrefs
    // (currently, this is only the id)
    if (target.closest(`.${uiStateLinkClass}`).length) {
      debugLog('Allowing original context menu on state link');
      return true;
    }

    evt.preventDefault();
    evt.stopPropagation();

    // Locate the card from event
    const element = target.closest(this.SELECTOR);
    const wpId = element.data('workPackageId');

    if (!wpId) {
      return true;
    } else {
      let classIdentifier = element.data('classIdentifier');
      let index = this.wpCardView.findRenderedCard(classIdentifier);

      if (!this.wpTableSelection.isSelected(wpId)) {
        this.wpTableSelection.setSelection(wpId, index);
      }

      const handler = new OpWorkPackageContextMenu(this.injector, wpId, jQuery(evt.target) as JQuery, {}, undefined, card.showInfoButton);
      this.opContextMenu.show(handler, evt);
    }

    return false;
  }
}

