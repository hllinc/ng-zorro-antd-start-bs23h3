import { Component, OnInit, ViewChild } from '@angular/core';
import { NzFormatEmitEvent, NzMessageService, NzModalService, NzTreeNode, NzTreeNodeOptions } from 'ng-zorro-antd';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // tree data
  nodes = [
    { title: 'Expand to load', key: '0' },
    { title: 'Expand to load', key: '1' },
    { title: 'Tree Node', key: '2', isLeaf: true }
  ];

  activedNode: NzTreeNode;


  @ViewChild('treeCom') treeCom;

  constructor(private modalService: NzModalService,
    private messageService: NzMessageService) {
  }

  nzClick(data: NzFormatEmitEvent): void {
    if (data.node === this.activedNode) {
      // 置空当前激活的节点以正常添加根节点
      this.activedNode = null;
    } else {
      this.activedNode = data.node;
    }
  }

  /**
   * 树节点展开事件
   * @param name
   * @param e
   */
  expandEvent(e: NzFormatEmitEvent): void {
    if (e.eventName === 'expand') {
      if (e.node.getChildren().length === 0 && e.node.isExpanded) {
        this.loadNode().then(data => {
          e.node.addChildren(data);
        });
      }
    }
  }

  loadNode(): Promise<NzTreeNodeOptions[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve([
        { title: 'Child Node', key: `${(new Date()).getTime()}-0` },
        { title: 'Child Node', key: `${(new Date()).getTime()}-1` }]),
        1000);
    });
  }

  /**
   * 添加节点
   */
  addOrg(): void {
    this.modalService.info({
      nzTitle: '添加根节点',
      nzContent: '注意看，添加根节点时点击树上的任一节点新增节点才会出现。'
    });
    const node = {
      key: `${(new Date()).getTime()}-0`,
      title: '新建节点',
      isLeaf: false
    };
    const newNode = new NzTreeNode(node);
    if (this.activedNode) {
      // 设置父节点不是子节点
      this.activedNode.isLeaf = false;
      // 添加子节点到该父节点下
      this.activedNode.addChildren([newNode]);
      // 设置父节点展开
      this.activedNode.setExpanded(true);
    } else {
      // 添加根节点
      this.treeCom.nzTreeService.rootNodes.push(newNode);
    }
    // 选中新增节点
    this.activedNode = newNode;
    this.activedNode.setSelected(true);
    this.messageService.create('success', '添加成功');
  }

  /**
   * 删除
   */
  deleteOrg(): void {
    if (!this.activedNode) {
      this.messageService.create('warning', '请选择节点');
      return;
    }
    this.modalService.confirm({
      nzTitle: '确定删除[' + this.activedNode.title + ']节点数据吗?',
      nzContent: this.activedNode.level === 0 ? '注意看，这里删除成功后点击树上的节点时删除的节点才会消失。': '子节点删除正常',
      nzOkText: '确定',
      nzOkType: 'danger',
      nzOnOk: () => {
        // 如果是根节点
        if (this.activedNode.level === 0) {
          this.treeCom.nzTreeService.rootNodes.forEach((node, index, array) => {
            if (node === this.activedNode) {
              // 删除节点
              this.treeCom.nzTreeService.rootNodes.splice(index, 1);
              return;
            }
          });
        } else {
          // 如果是子节点
          this.activedNode.remove();
        }
        this.messageService.create('success', '删除成功');

      },
      nzCancelText: '取消',
      nzOnCancel: () => console.log('Cancel')
    });
  }

  ngOnInit() {
  }
}