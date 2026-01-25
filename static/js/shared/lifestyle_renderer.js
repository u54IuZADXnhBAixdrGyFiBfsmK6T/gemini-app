/**
 * Lifestyle コンテンツレンダラー
 * JSONデータからHTMLを動的に生成
 */

export function renderLifestyleContent(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container not found: ${containerId}`);
        return;
    }

    // ローディング表示を削除
    const loading = container.querySelector('#content-loading');
    if (loading) loading.remove();

    // ヒーローセクション
    if (data.hero) {
        container.appendChild(createHero(data.hero));
    }

    // 目次
    if (data.toc && data.toc.items && data.toc.items.length > 0) {
        container.appendChild(createTOC(data.toc));
    }

    // セクション
    if (data.sections) {
        data.sections.forEach(section => {
            container.appendChild(createSection(section));
        });
    }

    // 参考文献
    if (data.references && data.references.items && data.references.items.length > 0) {
        container.appendChild(createReferences(data.references));
    }

    // ナビゲーション
    if (data.navigation && data.navigation.buttons) {
        container.appendChild(createNavigation(data.navigation));
    }
}

function createHero(hero) {
    const div = document.createElement('div');
    div.className = 'detail-hero';
    div.innerHTML = `
        <h1>${hero.title}</h1>
        <p class="subtitle">${hero.subtitle}</p>
    `;
    return div;
}

function createTOC(toc) {
    const div = document.createElement('div');
    div.className = 'toc';
    
    const items = toc.items.map(item => 
        `<li><a href="${item.href}">${item.text}</a></li>`
    ).join('');
    
    div.innerHTML = `
        <h2>${toc.title}</h2>
        <ul>${items}</ul>
    `;
    return div;
}

function createSection(section) {
    const sectionElem = document.createElement('section');
    sectionElem.className = 'content-section';
    sectionElem.id = section.id;
    
    // タイトル
    if (section.title) {
        const h2 = document.createElement('h2');
        h2.textContent = section.title;
        sectionElem.appendChild(h2);
    }
    
    // コンテンツ
    if (section.content) {
        section.content.forEach(item => {
            const elem = createContentElement(item);
            if (elem) sectionElem.appendChild(elem);
        });
    }
    
    return sectionElem;
}

function createContentElement(item) {
    if (!item || !item.type) return null;
    
    switch (item.type) {
        case 'paragraph':
            return createParagraph(item);
        case 'heading':
            return createHeading(item);
        case 'list':
            return createList(item);
        case 'box':
            return createBox(item);
        case 'stats_grid':
            return createStatsGrid(item);
        case 'table':
            return createTable(item);
        case 'styled_div':
            return createStyledDiv(item);
        case 'interactive_tool':
            return createInteractiveTool(item);
        default:
            console.warn('Unknown content type:', item.type);
            return null;
    }
}

function createParagraph(item) {
    const p = document.createElement('p');
    p.innerHTML = item.text;
    return p;
}

function createHeading(item) {
    const h = document.createElement(item.level);
    h.textContent = item.text;
    return h;
}

function createList(item) {
    const list = document.createElement(item.ordered ? 'ol' : 'ul');
    item.items.forEach(itemText => {
        const li = document.createElement('li');
        li.innerHTML = itemText;
        list.appendChild(li);
    });
    return list;
}

function createBox(item) {
    const div = document.createElement('div');
    div.className = `${item.box_type}-box`;
    
    let html = '';
    if (item.title) {
        html += `<h4>${item.title}</h4>`;
    }
    
    if (item.content) {
        item.content.forEach(contentItem => {
            const elem = createContentElement(contentItem);
            if (elem) {
                div.appendChild(elem);
            }
        });
    }
    
    if (html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        while (temp.firstChild) {
            div.insertBefore(temp.firstChild, div.firstChild);
        }
    }
    
    return div;
}

function createStatsGrid(item) {
    const div = document.createElement('div');
    div.className = 'stats-grid';
    
    item.cards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'stat-card';
        cardDiv.innerHTML = `
            <div class="stat-number">${card.number}</div>
            <div class="stat-label">${card.label}</div>
        `;
        div.appendChild(cardDiv);
    });
    
    return div;
}

function createTable(item) {
    const container = document.createElement('div');
    if (item.parent_style) {
        container.setAttribute('style', item.parent_style);
    }
    
    const table = document.createElement('table');
    if (item.table_style) {
        table.setAttribute('style', item.table_style);
    }
    
    // ヘッダー
    if (item.headers && item.headers.length > 0) {
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        item.headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            tr.appendChild(th);
        });
        thead.appendChild(tr);
        table.appendChild(thead);
    }
    
    // 行
    if (item.rows && item.rows.length > 0) {
        const tbody = document.createElement('tbody');
        item.rows.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.innerHTML = cell;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
    }
    
    container.appendChild(table);
    return container;
}

function createStyledDiv(item) {
    const div = document.createElement('div');
    if (item.style) {
        div.setAttribute('style', item.style);
    }
    
    if (item.content) {
        item.content.forEach(contentItem => {
            const elem = createContentElement(contentItem);
            if (elem) div.appendChild(elem);
        });
    }
    
    return div;
}

function createInteractiveTool(item) {
    // インタラクティブツールは元のHTMLに残すため、ここでは何もしない
    const div = document.createElement('div');
    div.innerHTML = `<p>⚠️ インタラクティブツールは元のHTMLテンプレートに実装してください (ID: ${item.id})</p>`;
    return div;
}

function createReferences(references) {
    const section = document.createElement('section');
    section.className = 'content-section references';
    section.id = 'references';
    
    const h2 = document.createElement('h2');
    h2.textContent = references.title;
    section.appendChild(h2);
    
    const ol = document.createElement('ol');
    references.items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = item;
        ol.appendChild(li);
    });
    section.appendChild(ol);
    
    return section;
}

function createNavigation(navigation) {
    const div = document.createElement('div');
    div.className = 'detail-navigation';
    
    navigation.buttons.forEach(button => {
        const a = document.createElement('a');
        a.href = button.href;
        a.className = 'nav-button';
        a.textContent = button.text;
        div.appendChild(a);
    });
    
    return div;
}