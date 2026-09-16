import { tr, type Lang, type Mode } from './workflow.ts';
export function editTasks(l: Lang) {
  return [
    [
      'edit-image-background',
      'image',
      'image-edit',
      tr(l, '更换图片背景', 'Replace an image background', '画像の背景変更'),
      tr(
        l,
        '明确只替换背景，保留主体身份、衣服、姿势和构图。说明新背景、透视、光线和接触阴影；指出边缘融合检查。',
        'Replace only the background; preserve identity, clothing, pose and framing. Specify the new setting, perspective, light and contact shadows; check edges.',
        '背景のみ変更し、人物・服・姿勢・構図は保持。新背景・遠近・光・接地影・境界を確認。',
      ),
    ],
    [
      'edit-image-repair',
      'image',
      'image-edit',
      tr(
        l,
        '修复模糊或老照片',
        'Restore a blurry or old photo',
        'ぼけ・古い写真の修復',
      ),
      tr(
        l,
        '区分划痕、噪点、褪色和模糊；保留真实面部与历史细节，未知内容不当作事实重建。给局部修复顺序和检查点。',
        'Distinguish scratches, noise, fading and blur. Preserve real identity and historical details; do not present invented details as recovered facts. Provide targeted repair steps.',
        '傷・ノイズ・退色・ぼけを区別。本人と歴史的細部を保持し、不明部分を復元事実としない。局所修復順を示す。',
      ),
    ],
    [
      'edit-image-object',
      'image',
      'image-edit',
      tr(
        l,
        '移除或替换局部物体',
        'Remove or replace an object',
        '物体の除去・置換',
      ),
      tr(
        l,
        '确认目标物体与区域，列出不可改动项；补齐遮挡后的背景纹理、光影和透视，不扩大修改范围。',
        'Identify the object and edit region; preserve other elements. Reconstruct background texture, lighting and perspective without expanding scope.',
        '対象物と範囲を確認し他要素を保持。背景の質感・光・遠近を整え変更を広げない。',
      ),
    ],
    [
      'edit-image-light',
      'image',
      'image-edit',
      tr(l, '调整光线与颜色', 'Adjust lighting and color', '光と色の調整'),
      tr(
        l,
        '确认亮度、色温、对比度和肤色目标，保留人物形态和物体材质；避免过曝、过度磨皮和风格漂移。',
        'Define brightness, color temperature, contrast and skin-tone goals. Preserve anatomy/materials; avoid clipping, excessive smoothing and style drift.',
        '明るさ・色温度・コントラスト・肌色を確認。形や質感を保ち白飛び・過度な美肌化を避ける。',
      ),
    ],
    [
      'edit-image-text',
      'image',
      'image-edit',
      tr(l, '修改图片文字', 'Change text in an image', '画像内文字の変更'),
      tr(
        l,
        '逐字列明旧文案与新文案、区域、字体风格和对齐。保留其他画面，生成后核对字形与拼写；无法准确生成时提供单独排字步骤。',
        'Specify exact old/new text, placement, style and alignment. Preserve the image; proofread rendered glyphs and offer separate typesetting if needed.',
        '旧文・新文を正確に指定し位置・書体・揃えを明示。他画面を保持し字形を確認、必要なら別組版。',
      ),
    ],
    [
      'edit-video-trim',
      'video',
      'video-edit',
      tr(l, '剪短视频但保留重点', 'Shorten a video', '要点を残して短縮'),
      tr(
        l,
        '依据实际素材或时间码提出保留、缩短和删除段落，保留关键操作与叙事。时长与完整性冲突先请用户选优先级，列出剪辑清单和预计时长。',
        'Use actual footage or timecodes to keep, shorten or remove segments. Preserve key steps; clarify timing conflicts and deliver an edit list with estimated duration.',
        '素材・タイムコードから残す/短縮/削除を指定。手順を保持し時間との競合を確認、編集一覧と予想尺を示す。',
      ),
    ],
    [
      'edit-video-captions',
      'video',
      'video-edit',
      tr(l, '修改字幕与台词', 'Edit captions and dialogue', '字幕・台詞の修正'),
      tr(
        l,
        '以提供的转写和时间码校对字幕，保留语义，标出听不清内容。区分字幕改字与重新配音，输出编号、起止时间和文本；无时间码不编造精确同步。',
        'Correct supplied transcripts/timecodes, preserving meaning and marking unclear audio. Separate caption edits from redubbing; do not invent exact timing.',
        '提供された文字起こし・時間で校正。不明音声を記し字幕変更と再録音を分離。時刻なしで正確な同期を捏造しない。',
      ),
    ],
    [
      'edit-video-audio',
      'video',
      'video-edit',
      tr(
        l,
        '调整配音、音乐与音量',
        'Adjust voice, music and levels',
        '音声・音楽・音量調整',
      ),
      tr(
        l,
        '确认需要保留的人声、音乐和环境音，按段落说明降噪、音量、淡入淡出与衔接。不要声称能完全恢复缺失音频；素材使用权需由用户确认。',
        'Identify voice, music and ambience to preserve; specify segment-level noise reduction, levels, fades and transitions. Do not promise recovery of missing audio.',
        '保持する声・音楽・環境音を確認し、区間別にノイズ・音量・フェード・接続を指示。欠落音の完全復元を約束しない。',
      ),
    ],
    [
      'edit-video-reframe',
      'video',
      'video-edit',
      tr(
        l,
        '横屏改竖屏与重新构图',
        'Reframe horizontal video vertically',
        '横動画を縦に再構図',
      ),
      tr(
        l,
        '确认目标比例和必须保留的主体、字幕与动作，逐段建议裁切、背景填充或重排；避免人物被切断与字幕越界，不保证扩展未知画面。',
        'Confirm target ratio, subjects, captions and action. Suggest cropping, padding or rearrangement per segment; avoid cut-off subjects and clipped captions.',
        '比率・主体・字幕・動作を確認。区間ごとの切抜き・余白・再配置を提案し欠けを防ぐ。未知画面の拡張を保証しない。',
      ),
    ],
    [
      'edit-video-continuity',
      'video',
      'video-edit',
      tr(
        l,
        '修正镜头衔接与一致性',
        'Repair shot continuity',
        'カット接続・一貫性修正',
      ),
      tr(
        l,
        '根据用户指出的镜头和问题，检查角色外观、道具、光向、轴线、视线和动作接点；区分可剪辑修复与需要重新生成，只修改受影响镜头。',
        'Use the supplied shot/problem to inspect identity, props, light, axis, eyeline and action cuts. Separate edit fixes from regeneration; limit changes to affected shots.',
        '指定カットの人物・道具・光・軸・視線・動作を確認。編集で直す部分と再生成を分け影響カットだけ修正。',
      ),
    ],
  ].map(([id, category, mode, label, description]) => ({
    id,
    category,
    mode: mode as Mode,
    label,
    description,
  }));
}
