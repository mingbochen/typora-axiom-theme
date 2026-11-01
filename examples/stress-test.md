---
title: Typora theme stress test
purpose: 检查极端输入与编辑状态
---

# 排版压力测试

[TOC]

## 长文本与窄窗口

这是一段较长的中文文本，用来检查窄窗口和不同缩放比例下的阅读效果。主题应当维持合理的左右留白，使长段落在自然换行后仍然容易阅读。English words should wrap naturally, and 中文与 English 混排不应该造成异常的字距。标点符号：“引号”、（括号）、《书名号》、破折号——以及省略号……都需要保持正常的字体表现。

**整段粗体文字也需要稳定的行高。Bold English text, 1024 tokens, 128 MiB，与中文粗体混排时，不应产生内容裁切。**

一个很长的链接：[https://example.org/research/inference/very-long-document-name-without-short-path?context=technical-documentation-and-rendering-tests](https://example.org/research/inference/very-long-document-name-without-short-path?context=technical-documentation-and-rendering-tests)。

行内长代码：`this_is_a_deliberately_long_identifier_for_checking_inline_code_wrapping_without_breaking_the_document_layout`。

## 代码和行号

```javascript
const message = "中文注释与 English strings";
const result = requests.map(request => ({ id: request.id, promptTokens: request.promptTokens, outputTokens: request.outputTokens, status: "ready", metadata: { source: "stress-test", sequence: 1024 } }));
console.log(message, result);
```

```
没有语言标签的代码块。
No language tag, no artificial label.

    Four spaces must remain four spaces.

Tabs and repeated spaces should not break caret positioning.
```

```json
{
  "model": "example-model",
  "stream": true,
  "max_tokens": 256,
  "messages": [{ "role": "user", "content": "解释一下前缀缓存。" }]
}
```

```bash
# 仅用于展示代码样式，不会自动运行
python benchmark.py --input-length 1024 --output-length 256
```

## 宽表格

| 记录 | 请求阶段 | 输入长度 | 输出长度 | 调度策略 | 首 token 延迟 | 每 token 延迟 | 备注 |
| :--- | :--- | ---: | ---: | :--- | ---: | ---: | :--- |
| A | Prefill | 1024 | 256 | Cache aware | 123.45 ms | 12.34 ms | 这是一段比较长的中文备注，用来测试宽表格 |
| B | Decode | 8192 | 1024 | Round robin | 234.56 ms | 23.45 ms | `very_long_configuration_key_without_spaces` |
| C | LongPrefillSchedulingStageWithoutWhitespace | 4096 | 512 | TokenBudgetPrioritySchedulerWithoutWhitespace | 345.67 ms | 34.56 ms | long_checkpoint_configuration_identifier_without_whitespace_for_print_layout |

## 嵌套与块元素

1. 第一项包含多个段落。

   第二个段落应当仍然属于第一项。

   > 列表中的引用要保留缩进，也要保持边框与正文的距离。

   ```python
   value = 42
   print(value)
   ```

2. 第二项回到同一个序列。
   - 二级无序列表。
     1. 三级有序列表。
     2. 第二个子项。

> 第一层引用。
>
> > 第二层引用。
> >
> > 包含 `inline code` 和 **加粗**。

- [ ] 未完成任务。
- [x] 已完成任务。
  - [ ] 嵌套任务：检查点击与光标位置。

## 数学、脚注和图片

行内表达式 $\mathrm{softmax}(QK^T/\sqrt{d})V$ 与正文混排。

较长行内表达式：$p_\theta(x_t\mid x_1,\ldots,x_{t-1})=\frac{\exp((Wh_t)_{x_t})}{\sum_{v\in\mathcal V}\exp((Wh_t)_v)}$，不应撑宽整页。复杂公式若要保持原字号，宜使用下面的块级形式。

$$
\operatorname{Attention}(Q,K,V) = \operatorname{softmax}\left(\frac{QK^{\mathsf T}}{\sqrt{d_k}}\right)V
$$

下面是一个需要横向检查的矩阵：

$$
A = \begin{bmatrix} 1 & 2 & 3 & 4 \\ 5 & 6 & 7 & 8 \\ 9 & 10 & 11 & 12 \end{bmatrix}
$$

下面这个较宽的矩阵应在公式区域内横向滚动，不能撑宽整页；打印时应适配纸张宽度：

$$
\begin{bmatrix} x_1 & x_2 & x_3 & x_4 & x_5 & x_6 & x_7 & x_8 & x_9 & x_{10} & x_{11} & x_{12} & x_{13} & x_{14} & x_{15} & x_{16} & x_{17} & x_{18} & x_{19} & x_{20} \end{bmatrix}
$$

脚注引用示例[^layout]。

[^layout]: 脚注用于补充来源和边界。检查字号、颜色、返回链接和 PDF 中的换行。

![本地矢量流程图](./assets/request-flow.svg)

![缺失图片的错误状态](./assets/intentionally-missing-image.png)

## 手动编辑检查

- 将光标移入和移出代码块，检查语言选择器、行号与编辑框。
- 切换源码模式、专注模式和打字机模式，检查光标与滚动。
- 点击任务复选框、表格单元格、图片和公式。
- 切换侧栏文件树和大纲，搜索词语并查看命中高亮。
- 在 100%、125%、150% 缩放下检查，确认没有文字裁切。
- 导出 HTML 和 PDF，检查长代码、宽表格、分页与图片。
